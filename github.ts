import config from "./xotodo.config.json" assert { type: "json" }

export async function getGithubIssues() {
  const issues = []
  let isLastPage = false
  let page = 1
  while (!isLastPage) {
    const cmd = ["curl",
      "-H", "Accept: application/vnd.github+json",
      "-H", `Authorization: Bearer ${config.githubPersonalAccessToken}`,
      `https://api.github.com/issues?page=${page}`
    ]
    const p = Deno.run({ cmd, stdout: "piped", stderr: "piped" })

    try {
      const res = new TextDecoder().decode(await p.output())
      const data = JSON.parse(res)

      if (!Array.isArray(data)) {
        console.warn(data)
        throw new Error("data is not an array")
      }

      issues.push(...data)
      page++

      // 30 = default page size
      if (data.length < 30) {
        isLastPage = true
        return issues
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}