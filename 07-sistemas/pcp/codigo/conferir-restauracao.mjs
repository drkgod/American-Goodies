import { readFileSync } from 'node:fs'
import { conferirRestauracao } from './src/lib/pcp/exportacao.ts'
const { resumo, esperado } = JSON.parse(readFileSync('restauracao-esperado.json', 'utf8'))
const rest = JSON.parse(readFileSync('restaurado.json', 'utf8'))
const ok = conferirRestauracao(resumo, rest)
console.log('POSITIVO', JSON.stringify(ok))
const sem = { ...rest }
delete sem.pcp_volumes
console.log('NEGATIVO (coleção faltando)', JSON.stringify(conferirRestauracao(resumo, sem)))
const total = Object.values(esperado).reduce((a, b) => a + b, 0)
console.log('colecoes', Object.keys(esperado).length, 'registros', total)
console.log(Object.entries(esperado).filter(([, n]) => n > 0).map(([c, n]) => c + '=' + n + '/' + rest[c]).join(' '))
