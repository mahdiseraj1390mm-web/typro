import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import * as querystring from 'querystring';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly username = process.env.MELLI_PAYAMAK_USERNAME || '9017335306';
  private readonly password = process.env.MELLI_PAYAMAK_PASSWORD || '97674c67-0460-4c5d-a0a4-e824986ef0dd';
  private readonly sender   = process.env.MELLI_PAYAMAK_SENDER   || '50004001335306';
  private readonly apiKey   = process.env.MELLI_PAYAMAK_API_KEY  || '97674c67-0460-4c5d-a0a4-e824986ef0dd';

  // ─── HTTPS POST helper ──────────────────────────────────────────────────────
  private httpsPost(
    hostname: string,
    path: string,
    body: object | string,
    contentType = 'application/json',
  ): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);

      const options: https.RequestOptions = {
        hostname,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(payload),
          'Accept': 'application/json, text/xml',
          'User-Agent': 'Typro-Platform/1.0',
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
      });

      req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
      req.on('error', (e) => reject(e));
      req.write(payload);
      req.end();
    });
  }

  // ─── HTTPS form-encoded POST ────────────────────────────────────────────────
  private httpsFormPost(
    hostname: string,
    path: string,
    fields: Record<string, string>,
  ): Promise<{ status: number; body: string }> {
    return this.httpsPost(hostname, path, querystring.stringify(fields), 'application/x-www-form-urlencoded');
  }

  /**
   * ارسال پیامک واقعی از طریق ملی پیامک
   *
   * روش ۱: REST API (JSON) — rest.payamak-panel.com/api/SendSMS/SendSMS
   * روش ۲: ASMX Web Service — api.payamak-panel.com/post/Send.asmx/SendSimpleSMS2
   *
   * کدهای خطا:
   *  > 0   → موفق (Message ID)
   *  -1    → نام کاربری یا رمز اشتباه
   *  -6    → سرویس غیرفعال
   *  -7    → تعداد ارسال روزانه بیش از حد
   *  -8    → شماره موبایل نامعتبر
   *  -110  → آی‌پی سرور در پنل whitelist نشده → باید در پنل ملی‌پیامک ثبت شود
   */
  async sendSms(to: string, text: string): Promise<{ success: boolean; result?: any; error?: string }> {
    const mobile = to.replace(/\D/g, '');
    this.logger.log(`[SMS] → ${mobile}`);

    // ── روش ۱: REST JSON API ────────────────────────────────────────────────
    try {
      const res = await this.httpsPost(
        'rest.payamak-panel.com',
        '/api/SendSMS/SendSMS',
        {
          username: this.username,
          password: this.password,
          to:       mobile,
          from:     this.sender,
          text,
          isFlash:  false,
        },
      );

      this.logger.log(`[SMS] REST: HTTP ${res.status} → ${res.body.substring(0, 100)}`);

      if (res.status === 200) {
        try {
          const data = JSON.parse(res.body);
          const val  = Number(data?.Value ?? -999);

          if (val > 0) {
            this.logger.log(`[SMS] ✅ ارسال شد — ID: ${val}`);
            return { success: true, result: { messageId: val } };
          }
          if (val === -1)   return { success: false, error: 'نام کاربری یا رمز پنل پیامک اشتباه است.' };
          if (val === -6)   return { success: false, error: 'سرویس پیامک در پنل غیرفعال است.' };
          if (val === -7)   return { success: false, error: 'تعداد ارسال روزانه بیش از حد مجاز است.' };
          if (val === -8)   return { success: false, error: 'شماره موبایل وارد شده نامعتبر است.' };
          if (val === -110) {
            this.logger.warn('[SMS] آی‌پی محدود (-110) → تلاش با ASMX...');
            // fall through to Method 2
          } else {
            this.logger.warn(`[SMS] REST code ${val} → تلاش با ASMX...`);
          }
        } catch { /* JSON parse error, fallthrough */ }
      }
    } catch (e: any) {
      this.logger.warn(`[SMS] REST error: ${e.message} → تلاش با ASMX...`);
    }

    // ── روش ۲: ASMX Web Service (form-encoded) ─────────────────────────────
    try {
      const res = await this.httpsFormPost(
        'api.payamak-panel.com',
        '/post/Send.asmx/SendSimpleSMS2',
        {
          username: this.username,
          password: this.password,
          to:       mobile,
          from:     this.sender,
          text,
          isflash:  'false',
        },
      );

      this.logger.log(`[SMS] ASMX: HTTP ${res.status} → ${res.body.substring(0, 120)}`);

      if (res.status === 200) {
        // Parse XML: <string xmlns="...">VALUE</string> or <long>VALUE</long>
        const xmlVal = res.body.match(/<(?:string|long|int)[^>]*>([\-\d]+)<\/(?:string|long|int)>/);
        if (xmlVal) {
          const val = Number(xmlVal[1]);
          if (val > 0) {
            this.logger.log(`[SMS] ✅ ASMX ارسال شد — ID: ${val}`);
            return { success: true, result: { messageId: val } };
          }
          if (val === -110) {
            this.logger.error('[SMS] ❌ خطا -110: آی‌پی سرور در پنل ملی‌پیامک مجاز نیست.');
            this.logger.error('[SMS] 🔧 راه‌حل: وارد پنل ملی‌پیامک → تنظیمات → محدودیت آی‌پی → "همه آی‌پی‌ها" را انتخاب یا آی‌پی سرور را اضافه کنید.');
            return {
              success: false,
              error: 'آی‌پی سرور در پنل ملی‌پیامک مجاز نیست. لطفاً در پنل ملی‌پیامک → تنظیمات → محدودیت آی‌پی، آی‌پی سرور را اضافه یا محدودیت را غیرفعال کنید.',
            };
          }
          if (val === -1)  return { success: false, error: 'نام کاربری یا رمز اشتباه.' };
          if (val === -6)  return { success: false, error: 'سرویس پیامک غیرفعال است.' };
          if (val === -8)  return { success: false, error: 'شماره موبایل نامعتبر.' };
          return { success: false, error: `خطای پنل پیامک: کد ${val}` };
        }
      }
    } catch (e: any) {
      this.logger.error(`[SMS] ASMX error: ${e.message}`);
    }

    return { success: false, error: 'سرویس پیامک در حال حاضر در دسترس نیست.' };
  }

  /**
   * ارسال کد تایید با خط خدماتی اشتراکی (عبور تضمینی از بلک‌لیست مخابرات)
   * پترن تاییدشده تایپرو در ملی‌پیامک: کد ۴۸۷۲۹۳
   * متن الگو: کد ورود شما : {0} میباشد.\nتایپرو
   */
  async sendOtp(to: string, code: string): Promise<{ success: boolean; result?: any; error?: string }> {
    const mobile = to.replace(/\D/g, '');
    this.logger.log(`[SMS-Pattern-OTP] → ${mobile} (Pattern 487293)`);

    // ۱. ارسال از طریق REST خط خدماتی اشتراکی (JSON Content-Type)
    try {
      const res = await this.httpsPost(
        'rest.payamak-panel.com',
        '/api/SendSMS/BaseServiceNumber',
        {
          username: this.username,
          password: this.password,
          text: code,
          to: mobile,
          bodyId: 487293,
        },
      );

      this.logger.log(`[SMS-Pattern-OTP] REST: HTTP ${res.status} → ${res.body}`);
      if (res.status === 200) {
        try {
          const data = JSON.parse(res.body);
          if (data?.RetStatus === 1 || Number(data?.Value) > 1000) {
            this.logger.log(`[SMS-Pattern-OTP] ✅ ارسال با خط خدماتی موفق بود — ID: ${data?.Value}`);
            return { success: true, result: data };
          }
        } catch { /* parse error, fall through */ }
      }
    } catch (e: any) {
      this.logger.warn(`[SMS-Pattern-OTP] REST error: ${e.message} → تلاش با SOAP...`);
    }

    // ۲. ارسال از طریق SOAP / ASMX به عنوان پشتیبان خط خدماتی
    try {
      const res = await this.httpsFormPost(
        'api.payamak-panel.com',
        '/post/Send.asmx/SendByBaseNumber2',
        {
          username: this.username,
          password: this.password,
          text: code,
          to: mobile,
          bodyId: '487293',
        },
      );

      this.logger.log(`[SMS-Pattern-OTP] SOAP: HTTP ${res.status} → ${res.body}`);
      if (res.status === 200) {
        const match = res.body.match(/<string[^>]*>([\d\-]+)<\/string>/);
        if (match) {
          const val = match[1];
          if (val.length > 5 && !val.startsWith('-')) {
            this.logger.log(`[SMS-Pattern-OTP] ✅ SOAP خط خدماتی موفق — ID: ${val}`);
            return { success: true, result: { messageId: val } };
          }
        }
      }
    } catch (e: any) {
      this.logger.error(`[SMS-Pattern-OTP] SOAP error: ${e.message}`);
    }

    // ۳. پشتیبان نهایی: ارسال معمولی در صورت بروز هرگونه مشکل در وب‌سرویس خدماتی
    this.logger.warn(`[SMS-Pattern-OTP] خط خدماتی با خطا مواجه شد؛ ارسال با خط اختصاصی...`);
    return this.sendSms(to, `کد ورود شما : ${code} میباشد.\nتایپرو`);
  }

  /**
   * ارسال رمز عبور جدید برای بازیابی حساب
   */
  async sendNewPassword(to: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const mobile = to.replace(/\D/g, '');
    this.logger.log(`[SMS-NewPassword] → ${mobile}`);

    // ۱. ارسال سریع با خط خدماتی اشتراکی (عبور از بلک‌لیست)
    try {
      const res = await this.httpsPost(
        'rest.payamak-panel.com',
        '/api/SendSMS/BaseServiceNumber',
        {
          username: this.username,
          password: this.password,
          text: newPass,
          to: mobile,
          bodyId: 487293,
        },
      );
      if (res.status === 200) {
        this.logger.log(`[SMS-NewPassword] ✅ ارسال رمز با خط خدماتی: ${res.body}`);
        return { success: true };
      }
    } catch (e: any) {
      this.logger.warn(`[SMS-NewPassword] پترن خط خدماتی ناموفق: ${e.message}`);
    }

    // ۲. پشتیبان: ارسال از خط اختصاصی
    const text = `تایپرو | رمز عبور جدید شما:\n${newPass}\nپس از ورود در پروفایل آن را تغییر دهید.\nhttps://typro.ir`;
    return this.sendSms(to, text);
  }
}
