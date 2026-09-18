import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main=fs.readFileSync("main.jsx","utf8");
const api=fs.readFileSync("api.js","utf8");

test("MVP2 exposes activation, returning login and admin routes",()=>{
  assert.match(main,/path==='\/login'/);
  assert.match(main,/path==='\/admin'/);
  assert.match(main,/function AccountActivation/);
  assert.match(main,/function Login/);
});

test("returning login is email/password without OTP",()=>{
  const start=main.indexOf("function Login()");
  const end=main.indexOf("function LegalTerm",start);
  const login=main.slice(start,end);
  assert.match(login,/\/api\/account\/login/);
  assert.match(login,/type="password"/);
  assert.doesNotMatch(login,/otp|OTP|code/i);
});

test("activation is the OTP boundary",()=>{
  assert.match(main,/\/api\/account\/activation\/start/);
  assert.match(main,/\/api\/account\/activation\/complete/);
  assert.match(main,/Código de ativação/);
});

test("API keeps server-returned CSRF for cross-origin admin and portal requests",()=>{
  assert.match(api,/estevez_admin_csrf/);
  assert.match(api,/estevez_portal_csrf/);
  assert.match(api,/\/api\/admin\/auth\/verify/);
  assert.match(api,/X-CSRF-Token/);
});
