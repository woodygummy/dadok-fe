import { mkdir } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"

const BASE = "http://127.0.0.1:43147"
const OUT = path.join(process.cwd(), "docs", "screens")

async function waitReady(page, text) {
  await page.waitForLoadState("networkidle")
  await page.getByText(text).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(400)
}

async function shot(page, name) {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((node) => node.remove())
  })
  const file = path.join(OUT, name)
  await page.screenshot({ path: file, type: "png" })
  console.log("wrote", file)
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "ko-KR",
})
const page = await context.newPage()
page.on("pageerror", () => {})
await page.addInitScript(() => {
  const hide = () => {
    const issues = document.querySelector("nextjs-portal")
    if (issues) issues.remove()
  }
  hide()
  new MutationObserver(hide).observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
})
await mkdir(OUT, { recursive: true })

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
await waitReady(page, "서재로 들어가는 문입니다.")
await shot(page, "01-login.png")

await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
await waitReady(page, "아이디, 비밀번호, 이메일만 있으면 됩니다.")
await shot(page, "02-signup.png")

await page.goto(`${BASE}/?preview=1`, { waitUntil: "networkidle" })
await waitReady(page, "다독이의 방")
await shot(page, "03-study.png")

await page.goto(`${BASE}/shelf?preview=1`, { waitUntil: "networkidle" })
await waitReady(page, "8/100")
await shot(page, "04-shelf.png")

await page.getByRole("button", { name: "책 추가" }).click()
await page.getByPlaceholder("책 제목 또는 저자").waitFor()
await page.waitForFunction(
  () => !document.body.innerText.includes("검색 중"),
  { timeout: 8000 }
).catch(() => {})
await page.waitForTimeout(400)
await shot(page, "05-add-book-modal.png")
await page.keyboard.press("Escape")
await page.waitForTimeout(300)

await page.getByRole("button", { name: "데미안 상세 보기" }).click()
await page.getByRole("dialog").waitFor()
await page.waitForFunction(
  () => !document.body.innerText.includes("소개를 불러오는 중"),
  { timeout: 8000 }
).catch(() => {})
await page.waitForTimeout(400)
await shot(page, "06-book-detail-modal.png")
await page.keyboard.press("Escape")
await page.waitForTimeout(300)

await page.goto(`${BASE}/me?preview=1`, { waitUntil: "networkidle" })
await waitReady(page, "문의 하기")
await shot(page, "07-me.png")

await browser.close()
