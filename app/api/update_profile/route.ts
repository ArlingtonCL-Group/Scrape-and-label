import { NextRequest, NextResponse } from 'next/server';

import User from '@/models/userModel';
import getDatabase from "@/database/database";
import { authOptions } from '../auth/[...nextauth]/options';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest ) {
    
    try {
        await getDatabase();

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        
        if (!token) {
            return NextResponse.json({ message: 'No session' }, { status: 404 });
        }

        const body = await req.json();
        const user = await User.findOne({ id: token._id });
        console.log(user)
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (body.username) user.username = body.username
        if (body.password) user.password = body.password
        if (body.avatar) user.avatar = body.avatar
        await user.save();

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error : unknown) {
        const err = error as Error;
        console.error('An error occurred:', err);
        return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await getDatabase();

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        
        if (!token) {
            return NextResponse.json({ message: 'No session' }, { status: 404 });
        }

        const user = await User.findOne({ id: token._id });
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        console.log(user)

        return NextResponse.json({ user });
    } catch (error : unknown) {
        const err = error as Error;
        console.error('An error occurred:', err);
        return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
    }
}