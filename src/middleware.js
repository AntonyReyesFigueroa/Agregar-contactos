import { NextResponse } from 'next/server';

export function middleware(request) {
    // Verificar si la cookie 'admin' existe
    const adminCookie = request.cookies.get('admin');

    // Si la cookie no existe y la ruta es '/', redirigir a '/login'
    if (!adminCookie && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Permitir el acceso a otras rutas o si la cookie existe
    return NextResponse.next();
}

// Configurar las rutas donde se aplicará el middleware
export const config = {
    matcher: ['/', '/dashboard/:path*'], // Añade otras rutas protegidas según sea necesario
};
