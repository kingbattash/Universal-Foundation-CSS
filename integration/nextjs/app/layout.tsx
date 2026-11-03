import "@stylexswc/webpack-plugin/stylex.css";
import "./globals.css";

export const metadata={
  title:"UF-CSS Independent Next.js Consumer",
  description:"Creator-owned design tokens tested with Next.js and StyleX"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
