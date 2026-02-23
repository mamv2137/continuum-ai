/**
 * Public Pages Layout
 *
 * Layout para páginas públicas (términos, privacidad, etc.)
 * Sin autenticación requerida
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
