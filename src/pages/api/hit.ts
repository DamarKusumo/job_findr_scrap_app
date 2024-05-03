// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
// import { karirRunner } from "@/scrapper/karir";


type Data = {
  state: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  // await karirRunner();
  res.status(200).json({ state: "Finish Hit" });
}
