declare module "unzipper" {
  import { Readable } from "stream"
  const unzipper: {
    Extract: (options: { path: string }) => NodeJS.WritableStream
    Open: {
      file: (path: string) => Promise<unknown>
    }
  }
  export default unzipper
}
