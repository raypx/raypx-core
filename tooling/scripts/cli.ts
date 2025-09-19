import { Listr } from "listr2"

async function cli(name: string, args: string[]) {
  const fn = (await import(`./${name}.ts`))?.default

  if (!fn) {
    console.error(`raypx-scripts ${name} not found`)
    process.exit(1)
  }

  try {
    const tasks = new Listr([
      {
        title: `Executing ${name}`,
        task: () => fn(...args),
      },
    ])
    await tasks.run()
  } catch (error: any) {
    console.error(`raypx-scripts ${name} error:`, error.message)
    console.error("raypx-scripts error stack:", error.stack)
    process.exit(1)
  }
}

export default cli
