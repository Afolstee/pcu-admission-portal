import base64
import hashlib
import hmac
import time
import uuid
import urllib.parse
import requests
from config import Config


class InterswitchClient:
    # ── OAuth token cache ─────────────────────────────────────────────────────
    _token: str | None = None
    _token_expires_at: float = 0.0

    @classmethod
    def _requery_base(cls) -> str:
        return Config.INTERSWITCH_BASE_URL

    # ── OAuth token ───────────────────────────────────────────────────────────
    @classmethod
    def _get_token(cls) -> str:
        now = time.time()
        if cls._token and now < cls._token_expires_at - 30:
            return cls._token

        client_id     = Config.INTERSWITCH_CLIENT_ID
        client_secret = Config.INTERSWITCH_CLIENT_SECRET

        credentials = base64.b64encode(
            f"{client_id}:{client_secret}".encode()
        ).decode()

        # OAuth token lives on passport.interswitchng.com regardless of the
        # collections API base URL.
        resp = requests.post(
            "https://passport.interswitchng.com/passport/oauth/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type":  "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials", "scope": "profile"},
            timeout=30,
        )
        resp.raise_for_status()
        body = resp.json()

        token                 = body["access_token"]
   
   
        cls._token            = token
        cls._token_expires_at = now + int(body.get("expires_in", 3600))
        return token

    @classmethod
    def _sign(cls, nonce: str, timestamp: str) -> str:
        client_id = Config.INTERSWITCH_CLIENT_ID
        secret    = Config.INTERSWITCH_CLIENT_SECRET
        body_b64  = base64.b64encode(hashlib.sha512(b"").digest()).decode()
        sign_str  = f"{client_id}{nonce}{timestamp}{body_b64}"
        return base64.b64encode(
            hmac.new(secret.encode(), sign_str.encode(), hashlib.sha512).digest()
        ).decode()

    @classmethod
    def _redirect_base(cls) -> str:
        base_url = Config.INTERSWITCH_BASE_URL.rstrip("/")
        # If the base URL is set to the live API domain, use the live Webpay redirect URL instead
        if "api.interswitchng.com" in base_url or "api.interswitch.com" in base_url:
            return "https://newwebpay.interswitchng.com"
        return base_url

    @classmethod
    def _redirect_hash(cls,
                       pay_item_id: str,
                       reference_no: str,
                       amount_kobo: int,
                       site_redirect_url: str) -> str:
        product_id = Config.INTERSWITCH_MERCHANT_CODE
        secret = Config.INTERSWITCH_CLIENT_SECRET
        currency = "566"

        hash_string = (
            f"{product_id}{pay_item_id}{reference_no}{amount_kobo}"
            f"{currency}{site_redirect_url}{secret}"
        )
        return hashlib.sha512(hash_string.encode()).hexdigest()

    @classmethod
    def build_redirect_url(cls,
                           pay_item_id: str,
                           reference_no: str,
                           amount_kobo: int,
                           customer_name: str,
                           customer_email: str,
                           site_redirect_url: str,
                           customer_id: str) -> str:
        base_url = cls._redirect_base()
        product_id = Config.INTERSWITCH_MERCHANT_CODE
        currency = "566"
        hash_value = cls._redirect_hash(
            pay_item_id,
            reference_no,
            amount_kobo,
            site_redirect_url,
        )

        is_live = "api.interswitchng.com" in Config.INTERSWITCH_BASE_URL or "api.interswitch.com" in Config.INTERSWITCH_BASE_URL

        params = {
            "product_id": product_id,
            "merchant_code": product_id,  # Aligns with live redirect parameter expected by newwebpay
            "pay_item_id": pay_item_id,
            "amount": amount_kobo,
            "currency": currency,
            "txn_ref": reference_no,
            "site_redirect_url": site_redirect_url,
            "cust_name": customer_name,
            "cust_email": customer_email,
            "cust_id": customer_id,
            "hash": hash_value,
            "mode": "LIVE" if is_live else "TEST",
        }
        return f"{base_url}/pay?{urllib.parse.urlencode(params)}"

    # ── Pay-item resolution ───────────────────────────────────────────────────
    @classmethod
    def _pay_item_id(cls, payment_type: str) -> str:
        mapping = {
            "application_fee": Config.INTERSWITCH_PAY_ITEM_ID_APP,
            "acceptance_fee":  Config.INTERSWITCH_PAY_ITEM_ID_ACC,
            "tuition":         Config.INTERSWITCH_PAY_ITEM_ID_TUI,
        }
        pay_item = mapping.get(payment_type)
        if not pay_item:
            raise ValueError(
                f"No pay_item_id configured for payment_type '{payment_type}'. "
                f"Check your .env file."
            )
        return pay_item

    # ── Server-side transaction verification ──────────────────────────────────
    @classmethod
    def requery_transaction(cls, reference_no: str, amount_kobo: int) -> dict:
        base_url      = cls._requery_base()
        merchant_code = Config.INTERSWITCH_MERCHANT_CODE
        full_url = (
            f"{base_url}/collections/api/v1/gettransaction.json"
            f"?transactionreference={reference_no}"
            f"&amount={amount_kobo}"
            f"&merchantcode={merchant_code}"
        )
        token     = cls._get_token()
        nonce     = uuid.uuid4().hex
        timestamp = str(int(time.time()))

        resp = requests.get(full_url, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
            "Nonce":         nonce,
            "Timestamp":     timestamp,
            "Signature":     cls._sign(nonce, timestamp),
        }, timeout=30)

        if resp.status_code == 404:
            return {
                "ResponseCode":        "T0",
                "ResponseDescription": "Transaction not found or still pending",
            }

        resp.raise_for_status()
        return resp.json()