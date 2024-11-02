
import "./globals.css";



export const metadata = {
  title: "Agregar contacto",
  description: "Agregar contactos desde pagina web",
  icons: {
    icon: '/agregar.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        {children}
      </body>
    </html>
  );
}
