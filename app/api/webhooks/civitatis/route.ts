import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeLanguage } from "@/lib/language";

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
  channel?: string | null;
  status?: "NEW" | "ASSIGNED" | "ON_PROGRESS" | "DONE" | "CANCELLED";
};

function nullable<T>(value: T | undefined | null): T | null {
  return value === undefined || value === "" ? null : value;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isNaN(date.getTime()) ? null : date;
}

function toTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date("1970-01-01T" + value + "Z");
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-webhook-secret");

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

    const channelCode = String(body?.channel ?? request.headers.get("x-channel-code") ?? "CIVITATIS").toUpperCase();
    const channelName = channelCode === "GYG" ? "GetYourGuide" : channelCode === "CIVITATIS" ? "Civitatis" : channelCode;
    const channel = await db.channel.upsert({
      where: { code: channelCode },
      create: {
        code: channelCode,
        name: channelName,
        status: "ACTIVE",
      },
      update: {
        name: channelName,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    let created = 0;
    let updated = 0;
    const skipped: string[] = [];

    for (const booking of bookings) {
      if (!booking.supplier_booking_id || !booking.tour_date) {
        skipped.push(String(booking.supplier_booking_id ?? "unknown"));
        continue;
      }

      const supplierBookingId = String(booking.supplier_booking_id);
      const tourDate = toDate(booking.tour_date);
      if (!tourDate) {
        skipped.push(supplierBookingId);
        continue;
      }
      const existing = await db.reservation.findUnique({
        where: {
          channelId_supplierBookingId: {
            channelId: channel.id,
            supplierBookingId,
          },
        },
        select: { id: true, customerName: true, customerEmail: true, customerPhone: true },
      });

      const createData = {
        supplierBookingId,
        supplierReference: nullable(booking.supplier_reference),
        bookingUrl: nullable(booking.booking_url),
        tourName: booking.tour_name ?? "Civitatis Tour",
        tourOption: nullable(booking.tour_option),
        tourDate,
        tourTime: toTime(booking.tour_time),
        customerName: booking.customer_name ?? existing?.customerName ?? "Unknown customer",
        customerEmail: nullable(booking.customer_email) ?? existing?.customerEmail ?? null,
        customerPhone: nullable(booking.customer_phone) ?? existing?.customerPhone ?? null,
        paxTotal: Number(booking.pax_total ?? 0),
        language: normalizeLanguage(booking.language),
        pickupTime: toTime(booking.pickup_time),
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
      const updateData = {
        ...(booking.supplier_reference !== undefined ? { supplierReference: nullable(booking.supplier_reference) } : {}),
        ...(booking.booking_url !== undefined ? { bookingUrl: nullable(booking.booking_url) } : {}),
        ...(booking.tour_name ? { tourName: booking.tour_name } : {}),
        ...(booking.tour_option !== undefined ? { tourOption: nullable(booking.tour_option) } : {}), tourDate,
        ...(booking.tour_time !== undefined ? { tourTime: toTime(booking.tour_time) } : {}),
        ...(booking.customer_name ? { customerName: booking.customer_name } : {}),
        ...(booking.customer_email !== undefined ? { customerEmail: nullable(booking.customer_email) } : {}),
        ...(booking.customer_phone !== undefined ? { customerPhone: nullable(booking.customer_phone) } : {}),
        ...(booking.pax_total !== undefined ? { paxTotal: Number(booking.pax_total) } : {}),
        ...(booking.language !== undefined ? { language: normalizeLanguage(booking.language) } : {}),
        ...(booking.pickup_time !== undefined ? { pickupTime: toTime(booking.pickup_time) } : {}),
        ...(booking.pickup_address !== undefined ? { pickupAddress: nullable(booking.pickup_address) } : {}),
        ...(booking.sale_price !== undefined ? { salePrice: nullable(booking.sale_price) } : {}),
        ...(booking.net_price !== undefined ? { netPrice: nullable(booking.net_price) } : {}),
        ...(booking.currency !== undefined ? { currency: booking.currency ?? "IDR" } : {}),
        ...(booking.customer_note !== undefined ? { customerNote: nullable(booking.customer_note) } : {}),
        ...(booking.internal_note !== undefined ? { internalNote: nullable(booking.internal_note) } : {}),
        ...(booking.status !== undefined ? { status: booking.status } : {}),
      };

      await db.reservation.upsert({
        where: {
          channelId_supplierBookingId: {
            channelId: channel.id,
            supplierBookingId,
          },
        },
        create: { channelId: channel.id, ...createData },
        update: updateData,
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
