import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect dashboard routes under the secret path
    if (pathname.startsWith('/rz-x9k7m/dashboard')) {
        const token = request.cookies.get('rz-session')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/rz-x9k7m?k=rizzon2026', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch {
            // Invalid or expired token
            const response = NextResponse.redirect(new URL('/rz-x9k7m?k=rizzon2026', request.url));
            response.cookies.set('rz-session', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/rz-x9k7m/dashboard/:path*'],
};
