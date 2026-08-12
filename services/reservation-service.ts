import { db } from "@/lib/db";

export type ReservationFilters = {
  date?: string;
  from?: string;
  to?: string;
  status?: string;
  channel?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getReservations(
  filters: ReservationFilters = {}
) {
  const page = Math.max(
    1,
    Number(filters.page ?? 1)
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(filters.limit ?? 20)
    )
  );

  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // =========================
  // DATE
  // =========================

  if (filters.date) {
    conditions.push(
      "r.tour_date = ?"
    );

    params.push(filters.date);
  } else if (
    filters.from ||
    filters.to
  ) {
    if (filters.from) {
      conditions.push(
        "r.tour_date >= ?"
      );

      params.push(filters.from);
    }

    if (filters.to) {
      conditions.push(
        "r.tour_date <= ?"
      );

      params.push(filters.to);
    }
  } else {
    /*
     * Default:
     * today sampai 7 hari ke depan
     */
    conditions.push(`
      r.tour_date BETWEEN
        CURDATE()
        AND DATE_ADD(
          CURDATE(),
          INTERVAL 7 DAY
        )
    `);
  }

  // =========================
  // STATUS
  // =========================

  if (filters.status) {
    conditions.push(
      "r.status = ?"
    );

    params.push(filters.status);
  }

  // =========================
  // CHANNEL
  // =========================

  if (filters.channel) {
    conditions.push(
      "c.code = ?"
    );

    params.push(filters.channel);
  }

  // =========================
  // SEARCH
  // =========================

  if (filters.search) {
    const searchFields = [
      "r.supplier_booking_id",
      "r.supplier_reference",
      "r.customer_name",
      "r.customer_email",
      "r.customer_phone",
      "r.tour_name",
      "r.tour_option",
      "r.pickup_address",
      "r.customer_note",
      "r.internal_note",
      "c.code",
      "c.name",
    ];

    conditions.push(`
      (
        ${searchFields
          .map(
            (field) =>
              `${field} LIKE ?`
          )
          .join(" OR ")}
      )
    `);

    const search =
      `%${filters.search}%`;

    params.push(
      ...searchFields.map(
        () => search
      )
    );
  }

  const where =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          " AND "
        )}`
      : "";

  // =========================
  // DATA
  // =========================

  const [rows] = await db.query(
    `
      SELECT
        r.*,

        c.id AS channel_id,
        c.code AS channel_code,
        c.name AS channel_name

      FROM reservations r

      LEFT JOIN channels c
        ON c.id = r.channel_id

      ${where}

      ORDER BY
        r.tour_date ASC,
        r.tour_time ASC,
        r.id ASC

      LIMIT ?
      OFFSET ?
    `,
    [
      ...params,
      limit,
      offset,
    ]
  );

  // =========================
  // TOTAL
  // =========================

  const [countRows] =
    await db.query(
      `
        SELECT
          COUNT(*) AS total

        FROM reservations r

        LEFT JOIN channels c
          ON c.id = r.channel_id

        ${where}
      `,
      params
    );

  const total = Number(
    (
      countRows as Array<{
        total: number;
      }>
    )[0]?.total ?? 0
  );

  return {
    data: rows,

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
}