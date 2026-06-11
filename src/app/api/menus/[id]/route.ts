import { NextResponse } from 'next/server';

/** Eski uç nokta — gün bazlı PUT /api/menus/day kullanın */
export async function PATCH() {
  return NextResponse.json(
    { error: 'Bu uç nokta kullanımdan kaldırıldı. /api/menus/day kullanın.' },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Bu uç nokta kullanımdan kaldırıldı. /api/menus/day kullanın.' },
    { status: 410 }
  );
}
