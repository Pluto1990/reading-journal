import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("GET books error:", error);

    return NextResponse.json(
      { message: "取得書籍失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.author) {
      return NextResponse.json(
        { message: "書名與作者為必填欄位" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        status: body.status || "想閱讀",
        rating: Number(body.rating) || 0,
        year: body.year || null,
        cover: body.cover || null,
        note: body.note || null,
      },
    });

    return NextResponse.json(book, {
      status: 201,
    });
  } catch (error) {
    console.error("POST book error:", error);

    return NextResponse.json(
      { message: "新增書籍失敗" },
      { status: 500 }
    );
  }
}