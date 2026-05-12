#!/usr/bin/env python3
"""
Test de carga para lectura de archivos
Lee archivos de la carpeta 'files' múltiples veces y mide el rendimiento
"""

import os
import time
import sys
from pathlib import Path


def format_size(bytes_size):
    """Formatea el tamaño en bytes a una representación legible"""
    for unit in ["B", "KB", "MB", "GB"]:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"


def format_time(seconds):
    """Formatea el tiempo en segundos a milisegundos si es pequeño"""
    if seconds < 1:
        return f"{seconds * 1000:.2f} ms"
    return f"{seconds:.2f} s"


def read_file_test(file_path, iterations=100):
    """
    Realiza un test de lectura del archivo

    Args:
        file_path: Ruta del archivo a leer
        iterations: Número de iteraciones de lectura
    """
    print(f"\n{'=' * 60}")
    print(f"Test de Carga - Lectura de Archivo")
    print(f"{'=' * 60}")
    print(f"Archivo: {file_path}")

    # Verificar que el archivo existe
    if not os.path.exists(file_path):
        print(f"❌ Error: El archivo no existe")
        return

    # Obtener información del archivo
    file_size = os.path.getsize(file_path)
    print(f"Tamaño: {format_size(file_size)}")
    print(f"Iteraciones: {iterations}")
    print(f"\n{'=' * 60}")

    # Almacenar tiempos de lectura
    read_times = []

    print("\nIniciando test de lectura...")

    for i in range(iterations):
        start_time = time.time()

        # Leer el archivo
        with open(file_path, "rb") as f:
            data = f.read()

        end_time = time.time()
        elapsed = end_time - start_time
        read_times.append(elapsed)

        # Mostrar progreso cada 10 iteraciones
        if (i + 1) % 10 == 0:
            print(f"  Progreso: {i + 1}/{iterations} lecturas completadas")

    # Calcular estadísticas
    total_time = sum(read_times)
    avg_time = total_time / len(read_times)
    min_time = min(read_times)
    max_time = max(read_times)

    # Calcular throughput
    total_bytes_read = file_size * iterations
    throughput_mb_s = (total_bytes_read / (1024 * 1024)) / total_time

    # Mostrar resultados
    print(f"\n{'=' * 60}")
    print(f"RESULTADOS DEL TEST")
    print(f"{'=' * 60}")
    print(f"Total de lecturas:     {iterations}")
    print(f"Bytes totales leídos:  {format_size(total_bytes_read)}")
    print(f"Tiempo total:          {format_time(total_time)}")
    print(f"\nTiempos de lectura:")
    print(f"  Promedio:            {format_time(avg_time)}")
    print(f"  Mínimo:              {format_time(min_time)}")
    print(f"  Máximo:              {format_time(max_time)}")
    print(f"\nThroughput:")
    print(f"  {throughput_mb_s:.2f} MB/s")
    print(f"{'=' * 60}\n")


def main():
    """Función principal"""
    # Configuración
    files_dir = "files"
    iterations = 100

    # Permitir especificar número de iteraciones por parámetro
    if len(sys.argv) > 1:
        try:
            iterations = int(sys.argv[1])
        except ValueError:
            print(
                f"⚠️  Advertencia: '{sys.argv[1]}' no es un número válido. Usando {iterations} iteraciones."
            )

    # Buscar archivos en la carpeta
    if not os.path.exists(files_dir):
        print(f"❌ Error: La carpeta '{files_dir}' no existe")
        return

    files = list(Path(files_dir).glob("*"))
    files = [f for f in files if f.is_file()]

    if not files:
        print(f"❌ Error: No hay archivos en la carpeta '{files_dir}'")
        return

    print(f"\nArchivos encontrados en '{files_dir}':")
    for i, file in enumerate(files, 1):
        size = os.path.getsize(file)
        print(f"  {i}. {file.name} ({format_size(size)})")

    # Realizar test para cada archivo
    for file_path in files:
        read_file_test(str(file_path), iterations)


if __name__ == "__main__":
    main()
