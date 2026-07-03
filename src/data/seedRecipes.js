export function getSeedRecipes() {
  const now = new Date()
  const make = (name, category, temperature) => ({
    name, category, temperature,
    isFavorite: false, photos: [], ingredients: [], steps: '', memo: '',
    createdAt: now, updatedAt: now,
  })
  const pair = (name, category) => [
    make(name, category, 'hot'),
    make(name, category, 'iced'),
  ]

  return [
    // ── 커피 (coffee.png 순서) ────────────────
    ...pair('아메리카노',         '커피'),
    ...pair('헤이즐럿아메리카',   '커피'),
    ...pair('콜드블루',           '커피'),
    ...pair('콜드블루라떼',       '커피'),
    ...pair('카페라떼',           '커피'),
    ...pair('바닐라라떼',         '커피'),
    ...pair('헤이즐럿라떼',       '커피'),
    ...pair('카라멜마키아또',     '커피'),
    ...pair('카페모카',           '커피'),
    ...pair('화이트모카',         '커피'),
    ...pair('민트모카',           '커피'),
    ...pair('카라멜모카',         '커피'),
    ...pair('화이트카라멜모카',   '커피'),
    ...pair('카프치노',           '커피'),
    ...pair('모카치노',           '커피'),
    ...pair('민트치노',           '커피'),
    ...pair('달고나카페라떼',     '커피'),
    ...pair('흑당카페라떼',       '커피'),
    ...pair('흑임자카페라떼',     '커피'),
    make('아보카도커피',          '커피',  'iced'),
    ...pair('에스프레소',         '커피'),
    make('마끼아또',              '커피',  'hot'),
    make('콘파나',                '커피',  'hot'),
    make('아포카토',              '커피',  'iced'),

    // ── 라떼스페셜 (스페셜라떼.png 순서) ─────
    make('단호박라떼',    '라떼스페셜', 'hot'),
    make('군고구마라떼',  '라떼스페셜', 'hot'),
    make('군고구마라떼',  '라떼스페셜', 'iced'),
    make('달고나라떼',    '라떼스페셜', 'hot'),
    make('달고나라떼',    '라떼스페셜', 'iced'),
    make('홍삼라떼',      '라떼스페셜', 'hot'),
    make('홍삼라떼',      '라떼스페셜', 'iced'),
    make('쑥라떼',        '라떼스페셜', 'hot'),
    make('흑임자라떼',    '라떼스페셜', 'hot'),
    make('흑임자라떼',    '라떼스페셜', 'iced'),

    // ── 음료 (beverage_tea_frappe_smoothie.png 순서) ──
    ...pair('초코',       '음료'),
    ...pair('민트초코',   '음료'),
    ...pair('화이트초코', '음료'),
    ...pair('녹차라떼',   '음료'),
    make('딸기라떼',      '음료', 'iced'),
    ...pair('밀크티',     '음료'),
    ...pair('흑당라떼',   '음료'),
    make('흑당버블티',    '음료', 'iced'),

    // ── 티 — 허브차 (얼그레이/루이보스/캐모마일/페퍼민트/녹차/자스민) ──
    ...pair('얼그레이', '티'),
    ...pair('루이보스', '티'),
    ...pair('캐모마일', '티'),
    ...pair('페퍼민트', '티'),
    ...pair('녹차',     '티'),
    ...pair('자스민',   '티'),

    // ── 티 — 수제차 (생강/유자차/모과차/오미자/매실차/백향과) ──
    ...pair('생강차',   '티'),
    ...pair('유자차',   '티'),
    ...pair('모과차',   '티'),
    ...pair('오미자차', '티'),
    ...pair('매실차',   '티'),
    ...pair('백향과차', '티'),

    // ── 프라페 (blended) ──────────────────────
    make('자바칩프라페',   '프라페', 'blended'),
    make('쿠앤크프라페',   '프라페', 'blended'),
    make('민트초코프라페', '프라페', 'blended'),
    make('그린티프라페',   '프라페', 'blended'),

    // ── 스무디 (blended) ─────────────────────
    make('딸기스무디',        '스무디', 'blended'),
    make('망고스무디',        '스무디', 'blended'),
    make('블루베리스무디',    '스무디', 'blended'),
    make('유자스무디',        '스무디', 'blended'),
    make('키위스무디',        '스무디', 'blended'),
    make('아보카도바나나주스','스무디', 'blended'),

    // ── 요거트 (blended) ─────────────────────
    make('플레인요거트',    '요거트', 'blended'),
    make('딸기요거트',      '요거트', 'blended'),
    make('망고요거트',      '요거트', 'blended'),
    make('키위요거트',      '요거트', 'blended'),
    make('블루베리요거트',  '요거트', 'blended'),
    make('유자요거트',      '요거트', 'blended'),
    make('베리베리요거트',  '요거트', 'blended'),

    // ── 에이드 & 아이스티 (iced) ─────────────
    make('레몬에이드',     '에이드', 'iced'),
    make('자몽에이드',     '에이드', 'iced'),
    make('오렌지에이드',   '에이드', 'iced'),
    make('청포도에이드',   '에이드', 'iced'),
    make('딸기에이드',     '에이드', 'iced'),
    make('백향과에이드',   '에이드', 'iced'),
    make('복숭아아이스티', '에이드', 'iced'),

    // ── 디저트 (dessert_other beverage.png 순서, 온도 없음) ──
    make('초코머핀',            '디저트', null),
    make('블루베리머핀',        '디저트', null),
    make('치즈머핀',            '디저트', null),
    make('와플',                '디저트', null),
    make('와플&아이스크림',     '디저트', null),
    make('고메크로플',          '디저트', null),
    make('플레인베이글',        '디저트', null),
    make('어니언베이글',        '디저트', null),
    make('블루베리베이글',      '디저트', null),
    make('허니브레드',          '디저트', null),
    make('뉴욕치즈케익',        '디저트', null),
    make('이탈리아티라미수케익','디저트', null),
    make('악마의초코케익',      '디저트', null),
    make('레드벨벳케익',        '디저트', null),
    make('블랙포레스트케익',    '디저트', null),
    make('젤리또아이스크림',    '디저트', null),
    make('생과일주스',          '디저트', null),
    make('대패빙수',            '디저트', null),
  ]
}
