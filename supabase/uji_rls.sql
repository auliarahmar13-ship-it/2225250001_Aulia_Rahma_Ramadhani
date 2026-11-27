-- =============================================================================
-- DeretKu: UJI RLS (Row Level Security). Jalankan SETELAH migrasi skema_awal, dengan persetujuan.
-- Supabase Dashboard → SQL Editor → tempel → Run.
--
-- Skrip ini membuat 2 akun UJI sementara (A dan B), mencoba berbagai akses, lalu ROLLBACK:
-- TIDAK ada data yang tertinggal. Bila semua lolos, hasil terakhir berbunyi
-- "SEMUA UJI RLS LOLOS". Bila ada yang gagal, muncul ERROR dengan nama uji yang gagal.
-- =============================================================================

begin;

-- Dua akun uji (UUID tetap; hanya hidup di dalam transaksi ini)
insert into auth.users (id, aud, role, email, raw_user_meta_data)
values
  ('00000000-0000-4000-a000-00000000000a', 'authenticated', 'authenticated', 'uji-a@deretku.invalid', '{"nama_panggilan":"Uji A","kelas":"VIII-A"}'),
  ('00000000-0000-4000-a000-00000000000b', 'authenticated', 'authenticated', 'uji-b@deretku.invalid', '{"nama_panggilan":"Uji B","kelas":"VIII-B"}');

-- Trigger harus membuat profil & progres otomatis
do $$ begin
  assert (select count(*) from public.profil where id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b')) = 2, 'UJI 1 GAGAL: profil tidak dibuat otomatis';
  assert (select count(*) from public.progres where user_id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b')) = 2, 'UJI 1 GAGAL: progres tidak dibuat otomatis';
  assert (select peran from public.profil where id = '00000000-0000-4000-a000-00000000000a') = 'siswa', 'UJI 1 GAGAL: peran bawaan bukan siswa';
end $$;

-- Satu aktivitas milik B (dibuat sebagai admin, sebelum berpura-pura menjadi A)
insert into public.aktivitas (id, user_id, jenis, waktu, data)
values ('00000000-0000-4000-b000-00000000000b', '00000000-0000-4000-a000-00000000000b', 'latihan', now(), '{"jenis":"beda","benar":true}');

-- ---- Berpura-pura menjadi siswa A yang sudah login
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

insert into public.aktivitas (id, jenis, waktu, data)
values ('00000000-0000-4000-b000-00000000000a', 'latihan', now(), '{"jenis":"beda","benar":false}');

do $$ begin
  assert (select count(*) from public.profil) = 1, 'UJI 2 GAGAL: A bisa melihat profil orang lain';
  assert (select count(*) from public.progres) = 1, 'UJI 2 GAGAL: A bisa melihat progres orang lain';
  assert (select count(*) from public.aktivitas) = 1, 'UJI 2 GAGAL: A bisa melihat aktivitas B';
  assert (select user_id from public.aktivitas) = '00000000-0000-4000-a000-00000000000a', 'UJI 2 GAGAL: user_id tidak otomatis milik A';
end $$;

do $$ begin  -- A mencoba menulis aktivitas atas nama B
  begin
    insert into public.aktivitas (id, user_id, jenis, waktu, data)
    values (gen_random_uuid(), '00000000-0000-4000-a000-00000000000b', 'kuis', now(), '{}');
    raise exception 'UJI 3 GAGAL: A bisa menambah aktivitas atas nama B';
  exception when insufficient_privilege then null;  -- ditolak RLS = benar
  end;
end $$;

do $$
declare n int;
begin  -- A mencoba menghapus & mengubah milik B (RLS: 0 baris terkena)
  delete from public.aktivitas where id = '00000000-0000-4000-b000-00000000000b';
  get diagnostics n = row_count;
  assert n = 0, 'UJI 4 GAGAL: A bisa menghapus aktivitas B';
  update public.progres set level_latihan = '{"beda":3}' where user_id = '00000000-0000-4000-a000-00000000000b';
  get diagnostics n = row_count;
  assert n = 0, 'UJI 4 GAGAL: A bisa mengubah progres B';
end $$;

do $$ begin  -- A mencoba mengangkat dirinya menjadi guru
  begin
    update public.profil set peran = 'guru' where id = '00000000-0000-4000-a000-00000000000a';
    raise exception 'UJI 5 GAGAL: siswa bisa mengubah peran';
  exception when insufficient_privilege then null;  -- kolom peran tidak boleh diubah = benar
  end;
end $$;

do $$ begin  -- A boleh mengubah nama & kelasnya sendiri
  update public.profil set nama_panggilan = 'Ani', kelas = 'VIII-C' where id = '00000000-0000-4000-a000-00000000000a';
  assert (select nama_panggilan from public.profil) = 'Ani', 'UJI 6 GAGAL: A tidak bisa mengubah namanya sendiri';
end $$;

-- ---- Berpura-pura menjadi tamu (belum login, kunci publishable saja)
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$ begin
  begin
    perform 1 from public.aktivitas;
    raise exception 'UJI 7 GAGAL: tamu (anon) bisa membaca tabel aktivitas';
  exception when insufficient_privilege then null;  -- hak anon dicabut = benar
  end;
end $$;

reset role;
rollback;  -- batalkan SEMUA data uji

-- Baris ini hanya tercapai bila semua uji di atas lolos (assert yang gagal menghentikan skrip).
select 'SEMUA UJI RLS LOLOS ✅ (data uji sudah dibatalkan dengan ROLLBACK)' as hasil;
