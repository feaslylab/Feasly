-- Phase 11A.1 - Deep Diagnostics

-- A) Tables with RLS OFF
SELECT n.nspname as schema, c.relname as table
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relkind='r' AND n.nspname NOT IN ('pg_catalog','information_schema')
  AND c.relrowsecurity = false
ORDER BY 1,2;

-- B) Policies that mention anon/public or are wide-open
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE roles @> array['anon'::name] OR roles @> array['public'::name]
   OR qual IS NULL OR qual='true'
ORDER BY 1,2,3;

-- C) Direct GRANTs to anon/public on tables/views/sequences  
SELECT table_schema, table_name, privilege_type, grantee
FROM information_schema.table_privileges
WHERE grantee IN ('anon','public')
ORDER BY 1,2,3,4;

-- D) Function EXECUTE privileges for anon/public (RPC exposure)
SELECT n.nspname as schema, p.proname as function, r.rolname as grantee
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_catalog.pg_roles r ON has_function_privilege(r.oid, p.oid, 'EXECUTE')
WHERE r.rolname IN ('anon','public')
  AND n.nspname NOT IN ('pg_catalog','information_schema','auth')
ORDER BY 1,2,3;

-- E) Default privileges that auto-grant to anon/public
SELECT defaclobjtype as obj_type, n.nspname as schema, r.rolname as grantee, d.defaclacl
FROM pg_default_acl d
LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
LEFT JOIN pg_roles r ON r.oid = d.defaclrole
ORDER BY 1,2,3;

-- F) Storage buckets that are public
SELECT id, name, public FROM storage.buckets ORDER BY 1;