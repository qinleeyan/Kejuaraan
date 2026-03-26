import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const validUser = process.env.ADMIN_USER;
        const validPass = process.env.ADMIN_PASS;
        const jwtSecret = process.env.JWT_SECRET;

        if (!validUser || !validPass || !jwtSecret) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        if (email !== validUser || password !== validPass) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT token
        const secret = new TextEncoder().encode(jwtSecret);
        const token = await new SignJWT({ email, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('rz-session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
