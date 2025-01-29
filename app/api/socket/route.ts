import { NextRequest, NextResponse } from "next/server";
import { Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: HTTPServer | undefined;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req:NextRequest, res:NextResponse) => {
  if (!res.socket?.server?.io) {
    
  }
};

export default handler