from datetime import datetime

# Datos de reservas activas (confirmed y pending)
reservas_data = [
    ['6ab9cbfb-5692-4c6a-8caf-4122373d6655', '00000000-0000-0000-0000-000000000003', '2025-08-24', '2025-08-25', 'confirmed', 'Ernesto'],
    ['78ba8d63-4581-457e-a804-58048de81946', '00000000-0000-0000-0000-000000000005', '2025-08-26', '2025-08-28', 'confirmed', 'Online'],
    ['98131534-fc7e-4eed-b92f-1611ee7efe82', '00000000-0000-0000-0000-000000000004', '2025-08-27', '2025-08-29', 'confirmed', 'Juan'],
    ['a4997e98-2176-4ac4-82e4-13a0d4e7c9c8', '00000000-0000-0000-0000-000000000005', '2025-08-22', '2025-08-24', 'confirmed', 'Aide'],
    ['a7981215-6e09-4fc6-9c84-ddb0ad0a61c0', '00000000-0000-0000-0000-000000000003', '2025-08-28', '2025-08-29', 'pending', 'Online'],
    ['d26c1dcd-9d06-454c-8ff6-b77b53fe18e5', '00000000-0000-0000-0000-000000000003', '2025-08-21', '2025-08-22', 'confirmed', 'Juan']
]

# Convertir fechas
reservas = []
for r in reservas_data:
    reservas.append({
        'id': r[0],
        'cabin_id': r[1],
        'check_in': datetime.strptime(r[2], '%Y-%m-%d'),
        'check_out': datetime.strptime(r[3], '%Y-%m-%d'),
        'status': r[4],
        'guest_name': r[5]
    })

print("=== ANÁLISIS DE CONFLICTOS DE CABAÑAS ===\n")

# Buscar conflictos por cabaña
conflictos = []
cabanas = list(set([r['cabin_id'] for r in reservas]))

for cabana in cabanas:
    reservas_cabana = [r for r in reservas if r['cabin_id'] == cabana]
    reservas_cabana.sort(key=lambda x: x['check_in'])
    
    for i in range(len(reservas_cabana)):
        for j in range(i + 1, len(reservas_cabana)):
            reserva1 = reservas_cabana[i]
            reserva2 = reservas_cabana[j]
            
            # Verificar solapamiento
            if (reserva1['check_in'] < reserva2['check_out'] and 
                reserva1['check_out'] > reserva2['check_in']):
                
                conflictos.append({
                    'cabana': cabana,
                    'reserva1': reserva1['guest_name'],
                    'fechas1': f"{reserva1['check_in'].strftime('%Y-%m-%d')} - {reserva1['check_out'].strftime('%Y-%m-%d')}",
                    'status1': reserva1['status'],
                    'reserva2': reserva2['guest_name'],
                    'fechas2': f"{reserva2['check_in'].strftime('%Y-%m-%d')} - {reserva2['check_out'].strftime('%Y-%m-%d')}",
                    'status2': reserva2['status']
                })

if conflictos:
    print("CONFLICTOS ENCONTRADOS:")
    for i, conflicto in enumerate(conflictos, 1):
        print(f"\n{i}. CABANA: {conflicto['cabana']}")
        print(f"   - {conflicto['reserva1']} ({conflicto['status1']}): {conflicto['fechas1']}")
        print(f"   - {conflicto['reserva2']} ({conflicto['status2']}): {conflicto['fechas2']}")
else:
    print("No se encontraron conflictos entre reservas activas")

print(f"\n=== RESUMEN ===")
print(f"Total reservas activas: {len(reservas)}")
print(f"Cabañas con reservas: {len(cabanas)}")
print(f"Conflictos detectados: {len(conflictos)}")