-- 0026: Los templates sembrados en 0011/0012 reclamaban rubros derogados por la
-- ley 27.742 (art. 99) y pedían inconstitucionalidad del art. 39 LRT (derogado
-- por la ley 26.773 en 2012). Se corrigen los prompts en la base (el generador
-- los lee de escrito_templates, no del código).

UPDATE escrito_templates
SET template_prompt = replace(
  template_prompt,
  '4. Derecho aplicable (citar arts. 232, 233, 245, 246 LCT, art. 2 Ley 25.323 si corresponde, y normativa específica)',
  '4. Derecho aplicable (citar arts. 232, 233, 245, 246 LCT, art. 2 Ley 25.323 si corresponde, y normativa específica). ATENCIÓN: si la fecha de despido es igual o posterior al 09/07/2024 NO reclames el art. 1 de la ley 25.323, las multas de los arts. 8/9/10/15 de la ley 24.013 ni la indemnización del art. 80 LCT (derogados por el art. 99 de la ley 27.742). Si es igual o posterior al 06/03/2026, aplicá el art. 245 según la ley 27.802 (base sin SAC ni conceptos no mensuales, piso del 67 %) y pedí la actualización por IPC + 3 % anual (art. 276 LCT).'
)
WHERE template_prompt LIKE '%4. Derecho aplicable (citar arts. 232, 233, 245, 246 LCT%';

UPDATE escrito_templates
SET template_prompt = replace(
  template_prompt,
  'Generá el escrito completo, formal, listo para presentar. Usá el estilo procesal argentino. Incluí todos los cálculos numéricos en la liquidación.',
  'Generá el escrito completo, formal, listo para presentar. Usá el estilo procesal argentino. Si se te provee un ANEXO DE LIQUIDACIÓN, transcribí sus importes sin recalcularlos; si no, incluí los cálculos numéricos en la liquidación aclarando que deben verificarse.'
)
WHERE template_prompt LIKE '%Incluí todos los cálculos numéricos en la liquidación.%';

UPDATE escrito_templates
SET campos_requeridos = replace(
  campos_requeridos::text,
  '"Art. 2 Ley 25.323", "Art. 80 LCT", "Horas extras"',
  '"Art. 2 Ley 25.323", "Art. 80 LCT (solo despidos anteriores al 09/07/2024)", "Art. 245 bis (despido discriminatorio)", "Horas extras"'
)::jsonb
WHERE campos_requeridos::text LIKE '%"Art. 2 Ley 25.323", "Art. 80 LCT", "Horas extras"%';

UPDATE escrito_templates
SET template_prompt = replace(
  template_prompt,
  '- Reclamo de indemnizaciones: art. 245, 232, 233 LCT, SAC proporcional, vacaciones, art. 80 LCT
- Intimación a entregar certificados art. 80 en plazo legal',
  '- Reclamo de indemnizaciones: art. 245, 232, 233 LCT, SAC proporcional, vacaciones, art. 2 ley 25.323
- Intimación a entregar los certificados del art. 80 LCT (sin reclamar la indemnización de 3 sueldos si el distracto es posterior al 09/07/2024: fue derogada por la ley 27.742)'
)
WHERE template_prompt LIKE '%- Intimación a entregar certificados art. 80 en plazo legal%';

UPDATE escrito_templates
SET template_prompt = replace(
  template_prompt,
  '5. Inconstitucionalidad del art. 39 LRT si corresponde (opción de reclamo integral vía derecho civil)',
  '5. Vía elegida: prestaciones de la LRT (con trámite previo ante la Comisión Médica, ley 27.348, CSJN "Pogonza" 2021) o reparación integral por el derecho civil (opción excluyente del art. 4 de la ley 26.773). El art. 39 inc. 1 LRT fue derogado por la ley 26.773: no pedir su inconstitucionalidad'
)
WHERE template_prompt LIKE '%5. Inconstitucionalidad del art. 39 LRT si corresponde%';

UPDATE escrito_templates
SET template_prompt = replace(
  template_prompt,
  'Generá el escrito completo, fundado en doctrina y jurisprudencia. Estilo procesal argentino formal.',
  'Generá el escrito completo. Fundalo en las normas aplicables; mencioná jurisprudencia solo si estás seguro de que existe y aclarando que el letrado debe verificar la cita. Estilo procesal argentino formal.'
)
WHERE template_prompt LIKE '%Generá el escrito completo, fundado en doctrina y jurisprudencia.%';
