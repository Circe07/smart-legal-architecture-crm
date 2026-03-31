$apiKey = "AIzaSyBQVkmgD7aGGypJLkOlQYZJ6y-P4A8SKNg"
$url = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=$apiKey"

$faqs = @(
    @{ id = "labor-dismissal-unfair"; q = "¿Cuál es la indemnización por despido improcedente en 2026?"; a = "Para contratos firmados después de febrero de 2012, la indemnización por despido improcedente es de 33 días por año trabajado, con un tope de 24 mensualidades. Si el contrato es anterior, se calculan 45 días por año para el tramo previo a dicha fecha." },
    @{ id = "labor-settlement-vs-indemnity"; q = "¿Qué diferencia hay entre el finiquito y la indemnización?"; a = "El finiquito (liquidación) es obligatorio tras cualquier cese e incluye salarios devengados, vacaciones no disfrutadas y parte proporcional de pagas extra. La indemnización es una compensación económica adicional que solo se paga en ciertos tipos de despido (objetivo o improcedente)." },
    @{ id = "labor-vacation-rights"; q = "¿Cuántos días de vacaciones me corresponden legalmente?"; a = "Según el Estatuto de los Trabajadores, tienes derecho a un mínimo de 30 días naturales por año trabajado (o 22 laborales). Si el contrato termina antes de disfrutarlas, la empresa debe abonarlas obligatoriamente en el finiquito." },
    @{ id = "labor-sick-leave-dismissal"; q = "¿Me pueden despedir estando de baja médica (IT)?"; a = "Estar de baja no impide legalmente un despido objetivo o disciplinario si existe una causa real ajena a la enfermedad. Sin embargo, si el despido se debe exclusivamente a la situación de salud, puede ser declarado nulo por discriminación bajo la Ley 15/2022." },
    @{ id = "labor-conciliation-adaptation"; q = "¿Tengo derecho a adaptar mi jornada sin reducir el sueldo?"; a = "Sí, bajo el Artículo 34.8 del Estatuto de los Trabajadores (la 'jornada a la carta'), puedes solicitar adaptaciones de duración y distribución de la jornada para conciliar vida familiar sin necesidad de reducir jornada ni salario, siempre que sea razonable y proporcionado." },
    @{ id = "labor-dismissal-objective"; q = "¿Qué indemnización corresponde por un despido objetivo?"; a = "El despido por causas económicas, técnicas, organizativas o de producción (objetivo) conlleva una indemnización de 20 días por año trabajado con un máximo de 12 mensualidades, además de un preaviso obligatorio de 15 días." },
    @{ id = "labor-plazo-impugnacion"; q = "¿Cuánto tiempo tengo para reclamar contra un despido?"; a = "El plazo es de 20 días hábiles (excluyendo sábados, domingos y festivos) desde la fecha de efectos del despido. Este plazo es de caducidad e improrrogable." },
    @{ id = "labor-modification-conditions"; q = "¿Qué pasa si la empresa cambia mi horario o salario?"; a = "Si la modificación es sustancial (Art. 41 ET), la empresa debe preavisar con 15 días. Si te perjudica, puedes rescindir el contrato con derecho a una indemnización de 20 días por año trabajado (máximo 9 meses) y acceso a prestación por desempleo." },
    @{ id = "labor-mobbing-action"; q = "¿Qué debo hacer ante una situación de acoso laboral (mobbing)?"; a = "Debes comunicar la situación por escrito a la empresa activando el protocolo de acoso. Si no se resuelve, puedes solicitar judicialmente la extinción del contrato con la misma indemnización que un despido improcedente, además de posibles daños y perjuicios." },
    @{ id = "labor-maternity-2026"; q = "¿Cuál es la duración del permiso por nacimiento en 2026?"; a = "En España, en 2026, el permiso por nacimiento y cuidado del menor para ambos progenitores se ha consolidado en 19 semanas." }
)

$results = @()

foreach ($faq in $faqs) {
    Write-Host "➡️ Procesando: $($faq.q)"
    $body = @{ content = @{ parts = @( @{ text = $faq.q } ) } } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
        $vector = $response.embedding.values
        $results += @{
            id = $faq.id
            content = "$($faq.q)`n`n$($faq.a)"
            vector = $vector
            metadata = @{ category = "Derecho Laboral"; updatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ") }
        }
        Write-Host "✅ Guardado: $($faq.id)"
    } catch {
        Write-Host "❌ Error en $($faq.id): $($_.Exception.Message)"
    }
}

$results | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 "packages/core/prisma/vector.db.json"
Write-Host "✨ BBDD Vectorial creada con éxito en packages/core/prisma/vector.db.json"
