#!/bin/bash

BASE="http://localhost:3000/api"
BASE="http://localhost:3000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="script_${TIMESTAMP}@teste.com"
PASS=0
FAIL=0

check() {
  local description=$1
  local expected=$2
  local actual=$3

  if echo "$actual" | grep -q "$expected"; then
    echo "✅ $description"
    PASS=$((PASS + 1))
  else
    echo "❌ $description"
    echo "   Esperado: $expected"
    echo "   Recebido: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "================================="
echo "   Kanban API — Testes de uso"
echo "================================="
echo ""

# Usuários
echo "--- Usuários ---"

RESULT=$(curl -s -X POST $BASE/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Teste Script\",\"email\":\"${TEST_EMAIL}\",\"phone\":\"11900000000\"}")
check "Criar usuário válido" '"id"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalido","phone":""}')
check "Rejeitar usuário inválido (400)" '"errors"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Duplicado\",\"email\":\"${TEST_EMAIL}\",\"phone\":\"11900000000\"}")
check "Rejeitar email duplicado (409)" '"error"' "$RESULT"

RESULT=$(curl -s $BASE/users)
check "Listar usuários" '"id"' "$RESULT"

echo ""
echo "--- Quadros ---"

RESULT=$(curl -s -X POST $BASE/boards \
  -H "Content-Type: application/json" \
  -d '{"name":"Board de Teste"}')
check "Criar quadro válido" '"id"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/boards \
  -H "Content-Type: application/json" \
  -d '{"name":""}')
check "Rejeitar quadro sem nome (400)" '"errors"' "$RESULT"

RESULT=$(curl -s $BASE/boards)
check "Listar quadros" '"id"' "$RESULT"

echo ""
echo "--- Colunas ---"

RESULT=$(curl -s -X POST $BASE/columns \
  -H "Content-Type: application/json" \
  -d '{"name":"Coluna Teste","board_id":1}')
check "Criar coluna válida" '"id"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/columns \
  -H "Content-Type: application/json" \
  -d '{"name":"Coluna","board_id":999}')
check "Rejeitar coluna com board inexistente (404)" '"error"' "$RESULT"

echo ""
echo "--- Cards ---"

RESULT=$(curl -s -X POST $BASE/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"Card Teste","description":"Desc","author_id":1,"column_id":1}')
check "Criar card válido" '"id"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"Card","author_id":999,"column_id":1}')
check "Rejeitar card com autor inexistente (404)" '"error"' "$RESULT"

RESULT=$(curl -s -X POST $BASE/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"Card","author_id":1,"column_id":999}')
check "Rejeitar card com coluna inexistente (404)" '"error"' "$RESULT"

echo ""
echo "--- Mover Card ---"

RESULT=$(curl -s -X PATCH $BASE/cards/1/move \
  -H "Content-Type: application/json" \
  -d '{"target_column_id":2}')
check "Mover card para coluna válida" '"column_id"' "$RESULT"

RESULT=$(curl -s -X PATCH $BASE/cards/1/move \
  -H "Content-Type: application/json" \
  -d '{"target_column_id":2}')
check "Mover card para mesma coluna (idempotente)" '"message"' "$RESULT"

RESULT=$(curl -s -X PATCH $BASE/cards/999/move \
  -H "Content-Type: application/json" \
  -d '{"target_column_id":1}')
check "Rejeitar card inexistente (404)" '"error"' "$RESULT"

# Cria board e coluna separados para testar regra de negócio
curl -s -X POST $BASE/boards -H "Content-Type: application/json" \
  -d '{"name":"Outro Board"}' > /dev/null
curl -s -X POST $BASE/columns -H "Content-Type: application/json" \
  -d '{"name":"Coluna Outro Board","board_id":2}' > /dev/null

RESULT=$(curl -s -X PATCH $BASE/cards/1/move \
  -H "Content-Type: application/json" \
  -d '{"target_column_id":999}')
check "Rejeitar movimento para outro quadro (422)" '"error"' "$RESULT"

echo ""
echo "================================="
echo "  ✅ Passou: $PASS  |  ❌ Falhou: $FAIL"
echo "================================="
echo ""