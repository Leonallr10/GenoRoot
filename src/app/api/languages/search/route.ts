import { NextRequest, NextResponse } from "next/server";
import { searchWhisperLanguages } from "@/lib/i18n/whisper-languages";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ languages: [] });
  }

  const languages = searchWhisperLanguages(query);
  return NextResponse.json({ languages });
}
