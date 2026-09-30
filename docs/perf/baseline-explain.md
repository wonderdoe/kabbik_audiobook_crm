# Baseline EXPLAIN — Phase 0

Database: staging (`DB_HOST` from `.env`, schema `kabbik`).  
Captured via `mysql` CLI.

## Rewards list query

```
id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	c	NULL	ALL	NULL	NULL	NULL	NULL	24	100.00	Using temporary; Using filesort
1	SIMPLE	u	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.user_id	1	100.00	NULL
1	SIMPLE	t	NULL	ref	FK_tier-user-current-tier_users,idx_tucct_user_id	FK_tier-user-current-tier_users	4	kabbik.c.user_id	1	100.00	NULL
1	SIMPLE	tr	NULL	ALL	PRIMARY	NULL	NULL	NULL	6	100.00	Using where; Using join buffer (hash join)
1	SIMPLE	rw	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.reward_id	1	100.00	NULL
```

**Notes:** `tier_user_reward_claim_log` (`c`) is **type=ALL** with **Using filesort** on `ORDER BY created_at`. No secondary indexes on claim log besides PRIMARY (`id`).

## Rewards count query

```
id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	c	NULL	ALL	NULL	NULL	NULL	NULL	24	100.00	NULL
1	SIMPLE	u	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.user_id	1	100.00	Using index
1	SIMPLE	t	NULL	ref	FK_tier-user-current-tier_users,idx_tucct_user_id	FK_tier-user-current-tier_users	4	kabbik.c.user_id	1	100.00	Using index
1	SIMPLE	tr	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.tier_id	1	100.00	Using index
1	SIMPLE	rw	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.reward_id	1	100.00	Using index
```

**Notes:** Full scan on claim log (`c` type=ALL). Joins use PK/FK indexes.

## Rewards summary query

```
id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	c	NULL	ALL	NULL	NULL	NULL	NULL	24	100.00	NULL
1	SIMPLE	u	NULL	eq_ref	PRIMARY	PRIMARY	4	kabbik.c.user_id	1	100.00	Using index
```

**Notes:** Full scan on claim log; `users` join is unnecessary when `WHERE 1=1` (no search) but still executed.
