<select className="form-select w-full" value={data.location_id} onChange={e => setData('location_id', e.target.value)}>
  <option value="">Bitte wählen…</option>
  {locations.map(l => (
    <option key={l.id} value={l.id}>{l.name}</option>
  ))}
</select>