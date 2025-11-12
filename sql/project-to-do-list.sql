CREATE TABLE
    sua_tabela_exemplo (
        id BIGINT PRIMARY KEY,
        id_user UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP
        WITH
            TIME ZONE NOT NULL,
            is_active BOOLEAN NOT NULL
    );

create policy "update_own" on tasks for
update using (id_user = auth.uid ());

alter policy "Enable read access for all users" on "public"."tasks" to public using (true);

alter policy "insert_user" on "public"."tasks" to public
with
    check ( (auth.uid () = id_user));

    