import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/lib/mongodb";

const formatDate = (dateString) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
};

export async function GET() {
  try {
    console.log("GET /api/expenses called");
    const client = await connectToDatabase();
    const db = client.db("expenseDB");
    const expenses = await db
      .collection("expenses")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const response = expenses.map((item) => ({
      id: item._id.toString(),
      description: item.description,
      amount: item.amount,
      date: item.date,
      category: item.category || "Other",
      createdAt: item.createdAt?.toISOString() || null,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Unable to fetch expenses from the database." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { description, amount, category, date } = body;

    if (
      !description ||
      typeof amount !== "number" ||
      amount <= 0 ||
      !category ||
      !date
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid expense payload. Provide description, amount, category, and date.",
        },
        { status: 400 }
      );
    }

    const normalizedDate = formatDate(date);
    if (!normalizedDate) {
      return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db("expenseDB");
    const newExpense = {
      description: description.toString(),
      amount,
      category: category.toString(),
      date: normalizedDate,
      createdAt: new Date(),
    };

    const result = await db.collection("expenses").insertOne(newExpense);

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        ...newExpense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      { error: "Unable to add expense to the database." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense id is required." }, { status: 400 });
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: "Invalid expense id." }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db("expenseDB");
    const result = await db.collection("expenses").deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/expenses error:", error);
    return NextResponse.json(
      { error: "Unable to delete expense from the database." },
      { status: 500 }
    );
  }
}
