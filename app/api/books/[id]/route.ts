import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// =========================
// GET 單筆書籍
// =========================

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return NextResponse.json(
        { message: "書籍 ID 格式錯誤" },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return NextResponse.json(
        { message: "找不到這本書" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("GET book error:", error);

    return NextResponse.json(
      { message: "取得書籍失敗" },
      { status: 500 }
    );
  }
}

// =========================
// PUT 編輯書籍
// =========================

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return NextResponse.json(
        { message: "書籍 ID 格式錯誤" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.author) {
      return NextResponse.json(
        { message: "書名與作者為必填欄位" },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { message: "找不到這本書" },
        { status: 404 }
      );
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: bookId,
      },

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

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("PUT book error:", error);

    return NextResponse.json(
      { message: "更新書籍失敗" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE 刪除書籍
// =========================

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return NextResponse.json(
        { message: "書籍 ID 格式錯誤" },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { message: "找不到這本書" },
        { status: 404 }
      );
    }

    await prisma.book.delete({
      where: {
        id: bookId,
      },
    });

    return NextResponse.json({
      message: "刪除成功",
    });
  } catch (error) {
    console.error("DELETE book error:", error);

    return NextResponse.json(
      { message: "刪除書籍失敗" },
      { status: 500 }
    );
  }
}