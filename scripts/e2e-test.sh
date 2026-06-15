#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:3000"
CUSTOMER_JAR=$(mktemp)
ADMIN_JAR=$(mktemp)
PASS=0
FAIL=0

cleanup() { rm -f "$CUSTOMER_JAR" "$ADMIN_JAR"; }
trap cleanup EXIT

ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL+1)); echo "  ❌ $1"; }

login() {
  local email=$1 pass=$2 jar=$3
  local csrf
  csrf=$(curl -s -c "$jar" "$BASE/api/auth/csrf" | python3 -c "import json,sys; print(json.load(sys.stdin)['csrfToken'])")
  curl -s -c "$jar" -b "$jar" -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "csrfToken=$csrf&email=$email&password=$pass" > /dev/null 2>&1
  local name
  name=$(curl -s -b "$jar" "$BASE/api/auth/session" | python3 -c "import json,sys; print(json.load(sys.stdin).get('user',{}).get('name',''))")
  echo "$name"
}

echo "=========================================="
echo "  E2E Test: Sipariş → Admin Bildirim"
echo "=========================================="

echo ""
echo "1) Müşteri girişi"
CUSTOMER_NAME=$(login "test@test.com" "test123" "$CUSTOMER_JAR")
if [ -n "$CUSTOMER_NAME" ]; then
  ok "Giriş: $CUSTOMER_NAME"
else
  fail "Giriş başarısız"
  exit 1
fi

echo ""
echo "2) Sepete ürün ekle"
PRODUCT_ID="cmp5cwnn200071z7mp2jfmwx7"
PRODUCT_NAME="Ethiopia Sidamo G2"
ADD_RESULT=$(curl -s -b "$CUSTOMER_JAR" -X POST "$BASE/api/sepet" \
  -H "Content-Type: application/json" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 1}")
if echo "$ADD_RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" 2>/dev/null; then
  ok "Sepete eklendi: $PRODUCT_NAME"
else
  fail "Sepete ekleme başarısız: $ADD_RESULT"
  exit 1
fi

echo ""
echo "3) Sipariş oluştur"
ORDER_RESPONSE=$(curl -s -b "$CUSTOMER_JAR" -X POST "$BASE/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingName": "Test User",
    "shippingAddress": "Test Adres No:123",
    "shippingCity": "İstanbul",
    "shippingPhone": "5551234567",
    "paymentMethod": "stripe",
    "useCekirdekKurus": 0
  }')
ORDER_ID=$(echo "$ORDER_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('order',{}).get('id',''))" 2>/dev/null)
ORDER_TOTAL=$(echo "$ORDER_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('order',{}).get('total',0))" 2>/dev/null)
if [ -n "$ORDER_ID" ]; then
  ok "Sipariş oluştu: #${ORDER_ID:0:8} (${ORDER_TOTAL} TL)"
else
  fail "Sipariş başarısız: $(echo "$ORDER_RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('error',''))")"
  exit 1
fi

echo ""
echo "4) Admin girişi + bildirim kontrolü"
ADMIN_NAME=$(login "admin@kahveci.com" "admin123" "$ADMIN_JAR")
if [ -n "$ADMIN_NAME" ]; then
  ok "Admin giriş: $ADMIN_NAME"
else
  fail "Admin giriş başarısız"
  exit 1
fi

sleep 1

NOTIF_RESPONSE=$(curl -s -b "$ADMIN_JAR" "$BASE/api/admin/bildirim")
UNREAD=$(echo "$NOTIF_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('unread',0))" 2>/dev/null)
SHORT_ID="${ORDER_ID:0:8}"
NOTIF_TITLE=$(echo "$NOTIF_RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
short = '$SHORT_ID'
for n in d.get('notifications',[]):
    if short in n.get('message',''):
        print(n.get('title',''))
        break
" 2>/dev/null)

if [ "$UNREAD" -gt 0 ] && [ -n "$NOTIF_TITLE" ]; then
  ok "Admin bildirimi bulundu: $NOTIF_TITLE (unread: $UNREAD)"
else
  fail "Bildirim bulunamadı (unread: $UNREAD)"
  echo "       Notif response: $NOTIF_RESPONSE"
fi

echo ""
echo "=========================================="
echo "  Sonuç: ✅ $PASS başarılı"
if [ "$FAIL" -gt 0 ]; then
  echo "          ❌ $FAIL başarısız"
else
  ok "Tüm testler geçti"
fi
echo "=========================================="
