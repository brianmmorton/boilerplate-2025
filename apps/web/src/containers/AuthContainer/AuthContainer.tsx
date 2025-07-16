import { WaveyBackground } from "components/WaveyBackground";

export const AuthContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-center align-middle h-dvh w-dvh">
      <WaveyBackground />
      <div className="z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}