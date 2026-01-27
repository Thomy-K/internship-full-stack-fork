import json
import os
from typing import Optional, Dict, Any

from openai import OpenAI
from pydantic import ValidationError, TypeAdapter
from fastapi import HTTPException

from schemas import ProgramResponse

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM = """You are a fitness coach assistant that outputs ONLY valid JSON.
No markdown, no code fences, no extra keys, no commentary.

You must output exactly ONE JSON object, and nothing else.

Your job is to either:
- Return a structured workout program (status="ok"), OR
- Reject the request (status="rejected") if the user text is not about workouts/fitness or is too vague.

Reject if:
- The request is unrelated to training/fitness/workouts/nutrition for training.
- The request is about coding, essays, math, translation, politics, etc.
- The request is too vague to build a plan (e.g., "hi", "help", "make a plan" with no details) AND there are no usable preferences.

If rejected:
- status must be "rejected"
- code must be "NOT_FITNESS" or "TOO_VAGUE"
- message must be short and clear
- hints should contain 1 to 3 concrete suggestions.

If ok:
- status must be "ok"
- days must be a list sorted by day ascending
- day starts at 1
- Provide warmup, cooldown, equipment list, estimated_calories, and exercises.
- focus must be very short (e.g., "upper body", "cardio", "full body").

Schema rules:
- Top-level keys must be exactly: status, days (no other keys).
- Each day must include ALL keys: day, focus, intensity, duration_minutes, equipment, warmup, exercises, cooldown, estimated_calories.
- Each exercise must include EXACT keys: name, sets, reps, rest_seconds. Use "reps" for both reps or time (e.g., "45s" or "8-12" or "1 min on / 30s off"). Do NOT use "reps_or_time".
- Do not output any extra keys anywhere.

Hard limits:
- Output at most 7 days.
- If sessions_per_week is provided, output exactly that many days (max 7).
- If sessions_per_week is missing, output 3 days.
- For warmup and cooldown: max 3 items each.
- For equipment: max 5 items.
- For exercises: 4 to 6 exercises per day.
Keep strings short (<= 60 chars).

Do not provide reasoning. Output the shortest valid JSON possible.
If you output anything other than a single JSON object, you fail.
"""

def build_user_prompt(text: str, preferences: Optional[Dict[str, Any]]) -> str:
    pref_block = json.dumps(preferences, ensure_ascii=False) if preferences else "null"
    return f"""User request:
{text}

Preferences (may be null):
{pref_block}

Reminder: Use reps as a string for reps OR time. Example reps values: "8-12", "45s", "1 min on / 30s off".

Return ONLY valid JSON for ProgramResponse.
No markdown, no comments, no extra keys."""


def extract_response_text(resp) -> str:
    out = getattr(resp, "output_text", None)
    if isinstance(out, str) and out.strip():
        return out.strip()

    out_text = ""
    output = getattr(resp, "output", None)
    if isinstance(output, list):
        for item in output:
            if getattr(item, "type", None) == "message":
                content = getattr(item, "content", None)
                if isinstance(content, list):
                    for c in content:
                        if getattr(c, "type", None) == "output_text":
                            t = getattr(c, "text", "")
                            if t:
                                out_text += t

    return out_text.strip()

def parse_program_response(text: str) -> ProgramResponse:
    data = json.loads(text)
    return TypeAdapter(ProgramResponse).validate_python(data)


def _call_llm(system: str, user: str, max_output_tokens: int) -> Any:
    return client.responses.create(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        reasoning={"effort": "low"},
        max_output_tokens=max_output_tokens,
    )

REPAIR_SYSTEM = """You fix JSON to match a strict schema.
Return ONLY a JSON object. No markdown. No commentary.

Rules:
- Keep the same meaning.
- Remove extra keys.
- Rename wrong keys to the correct ones.
- Ensure required fields exist with reasonable values.
- Output must validate against ProgramResponse schema.
"""

def generate_program(text: str, preferences: Optional[Dict[str, Any]] = None, retries: int = 2) -> ProgramResponse:
    prompt = build_user_prompt(text=text, preferences=preferences)

    last_exception = None

    for _ in range(retries + 1):
        try:
            resp = _call_llm(SYSTEM, prompt, max_output_tokens=2200)

            if getattr(resp, "status", None) == "incomplete":
                continue

            out_text = extract_response_text(resp)
            if not out_text:
                continue

            return parse_program_response(out_text)

        except (json.JSONDecodeError, ValidationError) as e:
            last_exception = e

            # ---- Repair attempt (1) ----
            try:
                # If it wasn't JSON at all, just retry normal
                if isinstance(e, json.JSONDecodeError):
                    continue

                # ValidationError: ask model to fix its JSON
                bad_json = out_text if "out_text" in locals() else ""
                if not bad_json:
                    continue

                # Keep errors short to be budget friendly
                err_txt = str(e)
                if len(err_txt) > 1200:
                    err_txt = err_txt[:1200]

                repair_user = f"""Fix this JSON so it validates.

                Validation errors:
                {err_txt}

                Bad JSON:
                {bad_json}

                Output ONLY the corrected JSON."""

                rep = _call_llm(REPAIR_SYSTEM, repair_user, max_output_tokens=1400)

                if getattr(rep, "status", None) == "incomplete":
                    continue

                fixed = extract_response_text(rep)
                if not fixed:
                    continue

                return parse_program_response(fixed)

            except Exception as e2:
                last_exception = e2
                continue

        except Exception as e:
            last_exception = e
            continue

    raise HTTPException(
        status_code=502,
        detail={
            "code": "AI_FAILED",
            "message": "AI could not generate a valid JSON program. Try again.",
            "debug": {"last_exception": repr(last_exception)} if os.getenv("ENV") == "dev" else None,
        },
    )


