// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { karirRunner } from "@/scrapper/karir";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const dataLen = await karirRunner();
  res.status(200).json({ status: 200, message: "Finish Hit, Data length: " + dataLen });
}
