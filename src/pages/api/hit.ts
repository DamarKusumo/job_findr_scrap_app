// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { karirRunner } from "../../scrapper/karir";
import { jobstreetRunner } from "../../scrapper/jobstreet";
import { kalibrrRunner } from "../../scrapper/kalibrr";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { source } = req.query;
  if (source === "karir") {
    try {
      const dataLen = await karirRunner();
      res.status(200).json({ status: 200, message: "Finish Hit, Data length: " + dataLen });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  } else if (source === "jobstreet") {
    try {
      const dataLen = await jobstreetRunner();
      res.status(200).json({ status: 200, message: "Finish Hit, Data length: " + dataLen });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  } else if (source === "kalibrr") {
    try {
      const dataLen = await kalibrrRunner();
      res.status(200).json({ status: 200, message: "Finish Hit, Data length: " + dataLen });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  }
}
