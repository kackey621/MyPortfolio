/* Runtime localization for the static language-specific URLs. */
(function () {
  "use strict";
  var locale=(document.documentElement.lang||"ja").split("-")[0];
  if(locale!=="en"&&locale!=="de") return;
  var column=locale==="en"?0:1;
  var M={
    "本文へスキップ":["Skip to content","Zum Inhalt springen"],
    "ホーム":["Home","Start"],"エンジニア":["Engineer","Softwareentwicklung"],"教育者":["Educator","Bildung"],"研究者":["Researcher","Forschung"],"経歴":["Profile","Profil"],"お知らせ":["News","Aktuelles"],
    "グローバルナビゲーション":["Global navigation","Hauptnavigation"],"配色を切り替え":["Toggle color theme","Farbschema wechseln"],"ソーシャルメディア":["Social media","Soziale Medien"],"表示言語":["Language","Sprache"],
    "まずは、実現したい未来について\nお聞かせください。":["Tell me about the future you want to create.","Erzählen Sie mir von der Zukunft, die Sie gestalten möchten."],
    "具体的な仕様が決まっていなくても構いません。開発・教育・研究のいずれのご相談も、最適なロードマップを一緒に描きます。":["You do not need a finished specification. For software, education, or research, we can shape the right roadmap together.","Eine fertige Spezifikation ist nicht nötig. Für Software, Bildung oder Forschung entwickeln wir gemeinsam die passende Roadmap."],
    "より多くの人が、より多くを成し遂げられる社会へ。":["Toward a society where more people can achieve more.","Für eine Gesellschaft, in der mehr Menschen mehr erreichen können."],
    "技術・教育・研究の三つの視点から、その一歩を支えます。":["I support that next step through software, education, and research.","Ich unterstütze diesen nächsten Schritt durch Software, Bildung und Forschung."],
    "目的別に見る →":["Explore by purpose →","Nach Anliegen entdecken →"],"経歴を見る":["View profile","Profil ansehen"],
    "自己紹介":["About","Über mich"],"技術は目的ではなく、手段です。私が向き合うのは、その先にある「人が何かを成し遂げられること」——ビジネスの成功であり、学びの手応えであり、新しい問いの発見です。":["Technology is a means, not the goal. What matters is helping people achieve something: business success, meaningful learning, or the discovery of a new question.","Technologie ist ein Mittel, nicht das Ziel. Entscheidend ist, Menschen beim Erreichen von etwas zu unterstützen: geschäftlicher Erfolg, spürbares Lernen oder eine neue Fragestellung."],
    "フリーランスエンジニア":["Freelance software engineer","Freiberuflicher Softwareentwickler"],"（2020年4月—現在）":["(April 2020–present)","(April 2020–heute)"],"理事長（2022年4月—現在）":["Chairperson (April 2022–present)","Vorstandsvorsitzender (April 2022–heute)"],"先端科学技術専攻 修士課程（在学中）":["Master’s program in Advanced Science and Technology","Masterstudium Advanced Science and Technology"],
    "目的別の、三つの顔":["Three areas of practice","Drei Arbeitsfelder"],"▸ システム開発をお考えの方へ":["▸ For organizations planning software development","▸ Für Organisationen mit Softwarevorhaben"],"▸ 情報教育に携わる方へ":["▸ For people working in computing education","▸ Für Menschen in der digitalen Bildung"],"▸ 研究・共同研究をお考えの方へ":["▸ For research and collaboration","▸ Für Forschung und Kooperation"],
    "詳しく見る":["Learn more","Mehr erfahren"],"現在の活動・主な経歴":["Current roles and selected experience","Aktuelle Rollen und ausgewählte Erfahrung"],"すべての案件・実績を見る":["View all projects and experience","Alle Projekte und Erfahrungen ansehen"],"主な活動歴以外も、技術・期間で絞り込めます":["Filter the complete record by technology and period.","Filtern Sie den vollständigen Werdegang nach Technologie und Zeitraum."],"主な活動歴":["Selected experience","Ausgewählte Erfahrung"],"現在":["Current","Aktuell"],"活動実績":["Experience","Erfahrung"],"詳細を見る →":["View details →","Details ansehen →"],"経歴ページで詳細を見る →":["View details on the profile page →","Details im Profil ansehen →"],
    "すべてのお知らせ →":["All news →","Alle Meldungen →"],"活動・実績に関するお知らせの一覧です。新しい順に掲載しています。":["News about activities, qualifications, and professional milestones, listed newest first.","Neuigkeiten zu Aktivitäten, Qualifikationen und beruflichen Meilensteinen, absteigend nach Datum."],
    "お知らせを絞り込む":["Filter news","Aktuelles filtern"],"条件をクリア":["Clear filters","Filter zurücksetzen"],"タグ":["Category","Kategorie"],"すべてのタグ":["All categories","Alle Kategorien"],"公開年":["Year","Jahr"],"すべての年":["All years","Alle Jahre"],"公開月":["Month","Monat"],"すべての月":["All months","Alle Monate"],"条件に一致するお知らせはありません。":["No news matches these filters.","Keine Meldung entspricht diesen Filtern."],"現在、お知らせはありません。":["There is currently no news.","Derzeit gibt es keine Meldungen."],
    "案件を絞り込む":["Filter projects","Projekte filtern"],"技術は複数選択できます。選択した技術をすべて含み、指定期間と重なる案件を表示します。":["Select multiple technologies. Results include every selected technology and overlap the chosen period.","Wählen Sie mehrere Technologien. Ergebnisse enthalten alle ausgewählten Technologien und überschneiden sich mit dem gewählten Zeitraum."],"参画期間":["Project period","Projektzeitraum"],"開始":["From","Von"],"終了":["To","Bis"],"指定なし":["Any","Beliebig"],"現在進行中のみ":["Current projects only","Nur laufende Projekte"],"案件の参画期間が、指定した年の範囲に一部でも重なるものを表示します。":["Shows projects whose active period overlaps the selected years.","Zeigt Projekte, deren Laufzeit sich mit den gewählten Jahren überschneidet."],"該当する案件がありません":["No matching projects","Keine passenden Projekte"],"技術を減らすか、期間を広げてお試しください。":["Select fewer technologies or broaden the period.","Wählen Sie weniger Technologien oder einen größeren Zeitraum."],
    "言語":["Languages","Sprachen"],"フレームワーク":["Frameworks","Frameworks"],"データベース":["Databases","Datenbanken"],"インフラ":["Infrastructure","Infrastruktur"],"プロダクト":["Platforms","Plattformen"],"メイン":["Primary","Schwerpunkt"],"実務あり":["Professional","Berufspraxis"],"利用可能":["Available","Verfügbar"],
    "案件 / Project":["Project","Projekt"],"期間":["Period","Zeitraum"],"稼働":["Duration","Dauer"],"規模":["Team","Team"],"立場":["Role","Rolle"],"担当した業務内容":["Responsibilities","Aufgaben"],"担当工程":["Delivery phases","Projektphasen"],"技術スタック":["Technology stack","Technologie-Stack"],"閉じる":["Close","Schließen"],"継続中":["Present","Heute"],
    "要件定義":["Requirements","Anforderungen"],"基本設計":["Architecture","Grobkonzept"],"詳細設計":["Detailed design","Feinkonzept"],"実装":["Implementation","Implementierung"],"テスト":["Testing","Tests"],"保守運用":["Operations","Betrieb"],
    "経営の視点で技術を選び、「作って終わり」にしない設計を。要件定義から保守運用まで、透明性の高いコミュニケーションで伴走します。":["Technology choices grounded in business needs, with systems designed beyond launch. I work transparently from requirements through long-term operations.","Technologieentscheidungen aus Geschäftssicht und Systeme, die über den Start hinaus gedacht sind. Transparente Begleitung von den Anforderungen bis zum Betrieb."],
    "ビジネス視点に立った技術選定":["Technology choices aligned with business goals","Technologieauswahl im Einklang mit Geschäftszielen"],"できること":["Capabilities","Leistungen"],"開発実績":["Engineering experience","Entwicklungserfahrung"],"「伝わらない」ストレスをゼロに":["Remove the friction of unclear communication","Unklare Kommunikation konsequent vermeiden"],"開発について相談する →":["Discuss a software project →","Softwareprojekt besprechen →"],
    "高等学校・情報科教育職員免許を保有。初学者に「伝わる」授業を追求し、効果的な教授法そのものを研究対象としてきました。":["Licensed to teach upper-secondary computing in Japan. I focus on instruction that reaches beginners and study effective teaching methods.","Lehrbefähigung für Informatik an japanischen Oberschulen. Im Mittelpunkt stehen verständliche Einstiege und wirksame Lehrmethoden."],"高校・情報科教員として":["As a computing educator","Als Lehrender für Informatik"],"指導歴":["Teaching experience","Lehrerfahrung"],"資格・指導領域":["Credentials and teaching scope","Qualifikationen und Lehrgebiete"],"指導実績":["Teaching record","Lehrpraxis"],
    "北陸先端科学技術大学院大学（JAIST）先端科学技術専攻に在籍。情報技術と教育の交差する領域に関心を持ち、実務と学術の双方から知見を積み重ねています。":["Master’s student in Advanced Science and Technology at JAIST, exploring the intersection of information technology and education through both practice and research.","Masterstudent im Bereich Advanced Science and Technology am JAIST mit Fokus auf die Verbindung von Informationstechnologie und Bildung in Praxis und Forschung."],"研究への関心":["Research interests","Forschungsinteressen"],"業績の公開":["Research profiles","Forschungsprofile"],"在籍・学術的背景":["Affiliation and academic background","Zugehörigkeit und akademischer Hintergrund"],"外部プロフィール":["External profiles","Externe Profile"],"関心領域":["Areas of interest","Interessengebiete"],
    "技術・教育・研究を往復してきた歩みと、その土台にある国際交流の経験。":["A career spanning software, education, and research, shaped by international experience.","Ein Werdegang zwischen Software, Bildung und Forschung, geprägt durch internationale Erfahrung."],"案件・実績":["Projects and experience","Projekte und Erfahrung"],"職歴・学歴":["Career and education","Beruf und Ausbildung"],"資格・受賞・国際交流":["Credentials, awards, and international experience","Qualifikationen, Auszeichnungen und internationale Erfahrung"],"免許・資格":["Credentials","Qualifikationen"],"受賞":["Awards","Auszeichnungen"],"国際交流":["International experience","Internationale Erfahrung"],
    "読み込み中…":["Loading…","Wird geladen…"],"お知らせ一覧へ戻る":["Back to news","Zurück zu Aktuelles"],"公開":["Published","Veröffentlicht"],"更新":["Updated","Aktualisiert"],"記事が指定されていません。":["No article was specified.","Es wurde kein Beitrag angegeben."],"記事を読み込めませんでした。":["The article could not be loaded.","Der Beitrag konnte nicht geladen werden."],
    "資格":["Credential","Qualifikation"],"進学":["Education","Studium"],"活動":["Activity","Aktivität"],"就任":["Appointment","Ernennung"],"独立":["Freelance","Freiberuflich"],
    "高等学校 情報科の教育職員免許状が交付されました":["Awarded a teaching license in upper-secondary computing","Lehrbefähigung für Informatik an Oberschulen erhalten"],"明星大学 通信教育課程（教科専門コース・高校公民）に入学しました":["Enrolled in Meisei University’s distance-learning program","Im Fernstudium der Meisei University eingeschrieben"],"早稲田大学高等学院 情報科TA（2022–2024）の任期を満了しました":["Completed my term as a computing teaching assistant at Waseda University Senior High School","Tätigkeit als Teaching Assistant für Informatik an der Waseda University Senior High School abgeschlossen"],"早稲田大学高等学院にて情報科ティーチング・アシスタントに着任":["Appointed computing teaching assistant at Waseda University Senior High School","Zum Teaching Assistant für Informatik an der Waseda University Senior High School ernannt"],"特定非営利活動法人 Willen の理事長に就任しました":["Appointed chairperson of the nonprofit organization Willen","Zum Vorstandsvorsitzenden der Nonprofit-Organisation Willen ernannt"],"早稲田大学高等学院 第72期 優秀論文作品賞を受賞":["Received the Outstanding Thesis Award at Waseda University Senior High School","Auszeichnung für eine herausragende Abschlussarbeit an der Waseda University Senior High School"],"フリーランスエンジニアとして活動を開始しました":["Began working as a freelance software engineer","Tätigkeit als freiberuflicher Softwareentwickler aufgenommen"],"日経STOCKリーグ 入選（日本経済新聞社）":["Selected in the Nikkei STOCK League competition","Auszeichnung im Wettbewerb Nikkei STOCK League"],
    "情報通信企業":["Information and communications company","Unternehmen für Information und Kommunikation"],"Web制作会社":["Web production company","Webagentur"],"システム開発会社":["Software development company","Softwareentwicklungsunternehmen"],"AI開発企業":["AI development company","KI-Entwicklungsunternehmen"],"Webサービス企業":["Web services company","Webdienst-Unternehmen"],"福祉サービス事業者":["Social services provider","Sozialdienstleister"]
  };

  function translate(value){
    var clean=String(value||"").trim();
    if(M[clean]) return M[clean][column];
    var m=/^([0-9]+)年$/.exec(clean); if(m) return locale==="en"?m[1]:m[1];
    m=/^([0-9]+)月$/.exec(clean); if(m) return locale==="en"?new Date(2000,Number(m[1])-1,1).toLocaleString("en",{month:"long"}):new Date(2000,Number(m[1])-1,1).toLocaleString("de",{month:"long"});
    m=/^\s*\/\s*([0-9]+)件を表示$/.exec(clean); if(m) return locale==="en"?"/ "+m[1]+" shown":"/ "+m[1]+" angezeigt";
    m=/^([0-9]+)年 · (.+)$/.exec(clean); if(m) return m[1]+(locale==="en"?" yrs · ":" J. · ")+translate(m[2]);
    return clean;
  }
  function translateNode(node){
    if(node.nodeType===3){
      var raw=node.nodeValue, clean=raw.trim();
      if(!clean) return;
      var out=translate(clean);
      if(out!==clean) node.nodeValue=raw.slice(0,raw.indexOf(clean))+out+raw.slice(raw.indexOf(clean)+clean.length);
      return;
    }
    if(node.nodeType!==1) return;
    if(/^(SCRIPT|STYLE|CODE|PRE)$/.test(node.tagName)) return;
    ["aria-label","title","placeholder"].forEach(function(attr){if(node.hasAttribute(attr)){var value=node.getAttribute(attr);var out=translate(value);if(out!==value)node.setAttribute(attr,out);}});
    Array.prototype.forEach.call(node.childNodes,translateNode);
  }
  window.translateText=translate;
  translateNode(document.documentElement);
  document.title=translate(document.title);
  new MutationObserver(function(records){records.forEach(function(record){
    if(record.type==="characterData") translateNode(record.target);
    Array.prototype.forEach.call(record.addedNodes||[],translateNode);
  });}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
