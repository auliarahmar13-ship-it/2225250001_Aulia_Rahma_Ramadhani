-- =============================================================================
-- DeretKu: skema awal Supabase (local-first). Rancangan: docs/13-rancangan-supabase.md
--
-- ⚠️ JANGAN dijalankan sebelum disetujui pemilik proyek.
-- Cara menjalankan (sekali): Supabase Dashboard → SQL Editor → New query → tempel isi
-- berkas ini → Run. Aman diulang? TIDAK (create table akan gagal bila sudah ada).
--
-- Prinsip keamanan:
-- 1. RLS aktif di SEMUA tabel; setiap siswa hanya melihat/mengubah barisnya sendiri
--    (auth.uid() = pemilik).
-- 2. Hak bawaan untuk role `anon` dan `authenticated` DICABUT, lalu diberikan seperlunya
--    (Supabase memberi semua hak secara bawaan, dan policy RLS tidak mencabutnya).
-- 3. Kolom `peran` tidak bisa diubah siswa (hak UPDATE hanya pada nama_panggilan & kelas).
-- 4. Fungsi trigger memakai SECURITY DEFINER + search_path kosong (praktik aman Supabase).
-- 5. Frontend hanya memakai kunci PUBLISHABLE. Kunci SECRET tidak pernah di browser/repositori.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. profil: satu baris per akun (dibuat otomatis oleh trigger saat akun dibuat)
-- -----------------------------------------------------------------------------
create table public.profil (
  id              uuid primary key references auth.users (id) on delete cascade,
  nama_panggilan  text not null default '' check (char_length(nama_panggilan) <= 40),
  kelas           text not null default '' check (char_length(kelas) <= 12),
  peran           text not null default 'siswa' check (peran in ('siswa', 'guru')),
  dibuat_pada     timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);
comment on table public.profil is 'DeretKu: profil siswa (nama panggilan & kelas). Tanpa data pribadi lain.';

-- -----------------------------------------------------------------------------
-- 2. progres: keadaan belajar terkini (padanan objek di app/js/state.js)
-- -----------------------------------------------------------------------------
create table public.progres (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  materi_selesai    jsonb not null default '{}'::jsonb,  -- { "u1": true, ... }
  posisi_kartu      jsonb not null default '{}'::jsonb,  -- { "u1": 3, ... }
  level_latihan     jsonb not null default '{}'::jsonb,  -- { "beda": 2, ... }
  literasi_selesai  jsonb not null default '{}'::jsonb,  -- { "L1": true, ... }
  pemanasan_selesai jsonb not null default '{}'::jsonb,  -- { "P1": true, ... }
  permainan         jsonb not null default '{}'::jsonb,  -- { "balon": { "rekor", "main", "terakhir" }, ... }
  pengaturan        jsonb not null default '{}'::jsonb,  -- musik, efek, ukuranTeks, animasi, ...
  diperbarui_pada   timestamptz not null default now(),
  constraint progres_berupa_objek check (
    jsonb_typeof(materi_selesai) = 'object' and jsonb_typeof(posisi_kartu) = 'object'
    and jsonb_typeof(level_latihan) = 'object' and jsonb_typeof(literasi_selesai) = 'object'
    and jsonb_typeof(pemanasan_selesai) = 'object' and jsonb_typeof(permainan) = 'object'
    and jsonb_typeof(pengaturan) = 'object'
  ),
  constraint progres_ukuran_wajar check (
    octet_length(materi_selesai::text || posisi_kartu::text || level_latihan::text
      || literasi_selesai::text || pemanasan_selesai::text || permainan::text || pengaturan::text) <= 32768
  )
);
comment on table public.progres is 'DeretKu: progres terkini per siswa (local-first; digabung dengan data di perangkat).';

-- -----------------------------------------------------------------------------
-- 3. aktivitas: riwayat yang hanya BERTAMBAH (pretes, pemanasan, latihan, kuis,
--    literasi, jurnal, beban). `id` dibuat di perangkat (UUID) agar kiriman ulang saat
--    sinkronisasi tidak tercatat dua kali. `data` = isi entri yang sama dengan ekspor JSON.
-- -----------------------------------------------------------------------------
create table public.aktivitas (
  id           uuid primary key,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jenis        text not null check (jenis in ('pretes', 'pemanasan', 'latihan', 'kuis', 'literasi', 'jurnal', 'beban')),
  waktu        timestamptz not null,
  data         jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 16384),
  id_perangkat text check (char_length(id_perangkat) <= 40),
  dibuat_pada  timestamptz not null default now()
);
comment on table public.aktivitas is 'DeretKu: riwayat belajar (hanya bertambah). Bentuk data = kontrak ekspor (CLAUDE.md).';
create index aktivitas_user_jenis_waktu on public.aktivitas (user_id, jenis, waktu);

-- -----------------------------------------------------------------------------
-- 4. RLS + hak akses minimum
-- -----------------------------------------------------------------------------
alter table public.profil    enable row level security;
alter table public.progres   enable row level security;
alter table public.aktivitas enable row level security;

revoke all on table public.profil, public.progres, public.aktivitas from anon, authenticated;

grant select                             on table public.profil    to authenticated;
grant update (nama_panggilan, kelas)     on table public.profil    to authenticated;  -- BUKAN peran
grant select, insert, update             on table public.progres   to authenticated;
grant select, insert, delete             on table public.aktivitas to authenticated;  -- tanpa update: riwayat tidak diubah

-- profil
create policy "profil: siswa melihat profilnya sendiri" on public.profil
  for select to authenticated using ((select auth.uid()) = id);
create policy "profil: siswa mengubah profilnya sendiri" on public.profil
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- progres
create policy "progres: melihat milik sendiri" on public.progres
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "progres: membuat milik sendiri" on public.progres
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progres: mengubah milik sendiri" on public.progres
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- aktivitas
create policy "aktivitas: melihat milik sendiri" on public.aktivitas
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "aktivitas: menambah milik sendiri" on public.aktivitas
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "aktivitas: menghapus milik sendiri" on public.aktivitas
  for delete to authenticated using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- 5. Otomatis: profil & progres kosong dibuat saat akun baru dibuat.
--    Nama & kelas boleh dikirim lewat metadata pendaftaran (dibatasi panjangnya).
--    `peran` TIDAK diambil dari metadata (mencegah siswa mengaku guru).
-- -----------------------------------------------------------------------------
create function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profil (id, nama_panggilan, kelas)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nama_panggilan', ''), 40),
    left(coalesce(new.raw_user_meta_data ->> 'kelas', ''), 12)
  );
  insert into public.progres (user_id) values (new.id);
  return new;
end;
$$;
revoke execute on function public.buat_profil_baru() from public, anon, authenticated;

create trigger saat_akun_dibuat
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

-- diperbarui_pada otomatis
create function public.set_diperbarui_pada()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

create trigger profil_diperbarui  before update on public.profil  for each row execute function public.set_diperbarui_pada();
create trigger progres_diperbarui before update on public.progres for each row execute function public.set_diperbarui_pada();

commit;
