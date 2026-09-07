import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type BookingPayload = {
  supplier_booking_id?: string | number;
  supplier_reference?: string | null;
  booking_url?: string | null;
  tour_name?: string | null;
  tour_option?: string | null;
  tour_date?: string | null;
  tour_time?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  pax_total?: number | string | null;
  language?: string | null;
  pickup_time?: string | null;
  pickup_address?: string | null;
  pickup_lat?: number | string | null;
  pickup_lng?: number | string | null;
  sale_price?: number | string | null;
  net_price?: number | string | null;
  currency?: string | null;
  customer_note?: string | null;
  internal_note?: string | null;
  status?: "NEW" | "ASSIGNED" | "ON_PROGRESS" | "DONE" | "CANCELLED";
};

function nullable(value: unknown) {
  return value === undefined || value === "" ? null : value;
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CIVITATIS_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-civitatis-webhook-secret");

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const bookings: BookingPayload[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.bookings)
        ? body.bookings
        : [];

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "bookings must be a non-empty array" },
        { status: 400 },
      );
    }

    const channel = await db.channel.findUnique({
      where: { code: "CIVITATIS" },
      select: { id: true },
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, message: "CIVITATIS channel is not configured" },
        { status: 500 },
      );
    }

    let created = 0;
    let updated = 0;
    const skipped: string[] = [];

    for (const booking of bookings) {
      if (!booking.supplier_booking_id || !booking.tour_date || !booking.customer_name) {
        skipped.push(String(booking.supplier_booking_id ?? "unknown"));
        continue;
      }

      const supplierBookingId = String(booking.supplier_booking_id);
      const existing = await db.reservation.findUnique({
        where: {
          channelId_supplierBookingId: {
            channelId: channel.id,
            supplierBookingId,
          },
        },
        select: { id: true },
      });

      const data = {
        supplierBookingId,
        supplierReference: nullable(booking.supplier_reference),
        bookingUrl: nullable(booking.booking_url),
        tourName: booking.tour_name ?? "Civitatis Tour",
        tourOption: nullable(booking.tour_option),
        tourDate: booking.tour_date,
        tourTime: nullable(booking.tour_time),
        customerName: booking.customer_name,
        customerEmail: nullable(booking.customer_email),
        customerPhone: nullable(booking.customer_phone),
        paxTotal: Number(booking.pax_total ?? 0),
        language: nullable(booking.language),
        pickupTime: nullable(booking.pickup_time),
        pickupAddress: nullable(booking.pickup_address),
        pickupLat: nullable(booking.pickup_lat),
        pickupLng: nullable(booking.pickup_lng),
        salePrice: nullable(booking.sale_price),
        netPrice: nullable(booking.net_price),
        currency: booking.currency ?? "IDR",
        customerNote: nullable(booking.customer_note),
        internalNote: nullable(booking.internal_note),
        status: booking.status ?? "NEW",
      };

      await db.reservation.upsert({
        where: {
          channelId_supplierBookingId: {
            channelId: channel.id,
            supplierBookingId,
          },
        },
        create: { channelId: channel.id, ...data },
        update: data,
      });

      if (existing) updated++;
      else created++;
    }

    return NextResponse.json({
      success: true,
      received: bookings.length,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error("[Civitatis Webhook Error]", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
