{{/*
Expand the name of the chart.
*/}}
{{- define "madden-records.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "madden-records.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "madden-records.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "madden-records.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Database host – internal or external
*/}}
{{- define "madden-records.dbHost" -}}
{{- if .Values.postgresql.enabled -}}
{{ include "madden-records.fullname" . }}-postgresql
{{- else -}}
{{ .Values.externalDatabase.host }}
{{- end }}
{{- end }}

{{- define "madden-records.dbName" -}}
{{- if .Values.postgresql.enabled -}}{{ .Values.postgresql.auth.database }}{{- else -}}{{ .Values.externalDatabase.database }}{{- end }}
{{- end }}

{{- define "madden-records.dbUser" -}}
{{- if .Values.postgresql.enabled -}}{{ .Values.postgresql.auth.username }}{{- else -}}{{ .Values.externalDatabase.username }}{{- end }}
{{- end }}

{{- define "madden-records.dbPassword" -}}
{{- if .Values.postgresql.enabled -}}{{ .Values.postgresql.auth.password }}{{- else -}}{{ .Values.externalDatabase.password }}{{- end }}
{{- end }}
