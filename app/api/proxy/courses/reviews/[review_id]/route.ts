import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  props: { params: Promise<{ review_id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/courses/reviews/${params.review_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      revalidatePath("/", "layout");
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ review_id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/courses/reviews/${params.review_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
      },
    );

    // Some APIs return 204 No Content for DELETE
    if (res.status === 204) {
      revalidatePath("/", "layout");
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json().catch(() => ({}));
    
    if (res.ok) {
      revalidatePath("/", "layout");
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
