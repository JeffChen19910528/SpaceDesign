'use strict'

window.LOCALES = {
  'zh-TW': {
    app_title: '系統設計練習工具',
    tab_srs: 'SRS 規格書',
    tab_ai_skill: 'AI Skill',
    tab_system_design: '系統設計',
    btn_scenario: '📋 情境練習',
    btn_settings: '⚙ 設定',

    scenario_badge_srs: 'SRS 規格書',
    scenario_badge_ai_skill: 'AI Skill',
    scenario_badge_system_design: '系統設計',
    scenario_req_title: '需求清單',
    scenario_hints_title: '💡 撰寫提示',
    scenario_btn_hint: '💡 提示',
    scenario_btn_hint_close: '💡 收起提示',
    scenario_btn_next: '↺ 換題',
    scenario_btn_ai: '✨ AI 出題',
    scenario_generating: 'AI 正在生成新題目...',
    scenario_ai_title: 'AI 生成題目',

    editor_upload: '📁 上傳檔案',
    editor_clear: '🗑 清除',
    editor_placeholder: '在此輸入你的文件內容\n\n或將 .txt / .md 檔案拖曳至此處...',
    editor_chars: '字',
    editor_evaluate: '🔍 開始評論',
    drop_overlay: '放開以上傳檔案',

    results_header: '評論結果',
    results_empty_text: '輸入文件後點擊「開始評論」',
    results_empty_hint: '支援 SRS 規格書、AI Skill 文件、系統設計文件',
    results_loading: '分析中...',

    score_label_good: '良好',
    score_label_fair: '待改善',
    score_label_poor: '需加強',
    tag_done: '✓ 完成',
    tag_missing: '✗ 缺失',
    tag_warning: '⚠ 警告',
    unit_items: ' 項',

    section_missing: '✗ 缺失項目',
    section_warnings: '⚠ 警告',
    section_found: '✓ 已完成項目',
    section_ai: '🤖 AI 詳細評論',
    badge_required: '必要',
    ai_loading_text: '等待本地模型回應...',

    settings_title: '設定',
    settings_engine_title: '評論引擎',
    settings_local_label: '啟用本地模型（Ollama）進行 AI 評論',
    settings_local_hint: '關閉時僅使用規則式評論；開啟後會額外呼叫本地 AI 模型進行深度分析',
    settings_model_title: '本地模型設定',
    settings_api_label: 'API 網址',
    settings_model_name_label: '模型名稱',
    settings_test_btn: '測試連線',
    settings_save_btn: '儲存設定',
    settings_testing: '測試中...',
    settings_test_ok: '連線成功 ✓',
    settings_test_fail: '連線失敗',

    doc_type_label_srs: 'SRS 規格書',
    doc_type_label_ai_skill: 'AI Skill',
    doc_type_label_system_design: '系統設計文件',

    ai_no_response: '（模型未回傳內容）',
    ai_no_connect: '無法連接本地模型',
    ai_check_ollama: '請確認 Ollama 已啟動，且模型名稱正確。',
    ai_prompt_default: '請評論以下文件，用繁體中文回答：\n',

    ai_gen_prompt: (typeName) =>
      `你是一位資深軟體工程師和技術面試官。請用繁體中文為「${typeName}」生成一道全新的情境練習題目。\n\n請完全按照以下格式回答（不要有其他多餘內容）：\n標題：[簡短的系統名稱，2-6個字]\n難度：[初級/中級/高級]\n情境：\n[2-3段描述，包含業務背景、規模數據、技術挑戰]\n需求：\n- [具體需求1]\n- [具體需求2]\n- [具體需求3]\n- [具體需求4]\n- [具體需求5]\n提示：\n- [撰寫文件的具體提示1]\n- [撰寫文件的具體提示2]\n- [撰寫文件的具體提示3]`,

    ai_parse: {
      title:    /標題[：:]\s*(.+)/,
      diff:     /難度[：:]\s*(.+)/,
      scenario: /情境[：:]\s*\n([\s\S]+?)(?=\n需求[：:]|\n提示[：:]|$)/,
      reqs:     /需求[：:]\s*\n([\s\S]+?)(?=\n提示[：:]|$)/,
      hints:    /提示[：:]\s*\n([\s\S]+?)$/,
      diffMap:  { '初級': 1, '中級': 2, '高級': 3 }
    }
  },

  'en': {
    app_title: 'System Design Practice Tool',
    tab_srs: 'SRS Spec',
    tab_ai_skill: 'AI Skill',
    tab_system_design: 'System Design',
    btn_scenario: '📋 Scenarios',
    btn_settings: '⚙ Settings',

    scenario_badge_srs: 'SRS',
    scenario_badge_ai_skill: 'AI Skill',
    scenario_badge_system_design: 'Sys Design',
    scenario_req_title: 'Requirements',
    scenario_hints_title: '💡 Writing Tips',
    scenario_btn_hint: '💡 Tips',
    scenario_btn_hint_close: '💡 Hide Tips',
    scenario_btn_next: '↺ Next',
    scenario_btn_ai: '✨ AI Generate',
    scenario_generating: 'AI is generating a new scenario...',
    scenario_ai_title: 'AI Generated Scenario',

    editor_upload: '📁 Upload',
    editor_clear: '🗑 Clear',
    editor_placeholder: 'Type your document content here\n\nOr drag & drop a .txt / .md file...',
    editor_chars: 'chars',
    editor_evaluate: '🔍 Evaluate',
    drop_overlay: 'Drop to upload',

    results_header: 'Evaluation Results',
    results_empty_text: 'Type a document and click "Evaluate"',
    results_empty_hint: 'Supports SRS, AI Skill, and System Design documents',
    results_loading: 'Analyzing...',

    score_label_good: 'Good',
    score_label_fair: 'Needs Work',
    score_label_poor: 'Insufficient',
    tag_done: '✓ Done',
    tag_missing: '✗ Missing',
    tag_warning: '⚠ Warning',
    unit_items: '',

    section_missing: '✗ Missing Items',
    section_warnings: '⚠ Warnings',
    section_found: '✓ Completed Items',
    section_ai: '🤖 AI Detailed Review',
    badge_required: 'Required',
    ai_loading_text: 'Waiting for local model response...',

    settings_title: 'Settings',
    settings_engine_title: 'Evaluation Engine',
    settings_local_label: 'Enable local model (Ollama) for AI review',
    settings_local_hint: 'When off, only rule-based evaluation is used. When on, a local AI model provides in-depth analysis.',
    settings_model_title: 'Local Model Settings',
    settings_api_label: 'API URL',
    settings_model_name_label: 'Model Name',
    settings_test_btn: 'Test Connection',
    settings_save_btn: 'Save Settings',
    settings_testing: 'Testing...',
    settings_test_ok: 'Connected ✓',
    settings_test_fail: 'Connection failed',

    doc_type_label_srs: 'SRS Specification',
    doc_type_label_ai_skill: 'AI Skill',
    doc_type_label_system_design: 'System Design Doc',

    ai_no_response: '(No response from model)',
    ai_no_connect: 'Cannot connect to local model',
    ai_check_ollama: 'Please ensure Ollama is running and the model name is correct.',
    ai_prompt_default: 'Please review the following document and respond in English:\n',

    ai_gen_prompt: (typeName) =>
      `You are a senior software engineer and technical interviewer. Generate a brand new scenario practice question for writing a "${typeName}" document.\n\nRespond EXACTLY in the following format (no extra content):\nTitle: [system name, 2-6 words]\nDifficulty: [Beginner/Intermediate/Advanced]\nScenario:\n[2-3 paragraphs: business context, scale numbers, technical challenges]\nRequirements:\n- [Specific requirement 1]\n- [Specific requirement 2]\n- [Specific requirement 3]\n- [Specific requirement 4]\n- [Specific requirement 5]\nHints:\n- [Document writing hint 1]\n- [Document writing hint 2]\n- [Document writing hint 3]`,

    ai_parse: {
      title:    /Title[：:]\s*(.+)/i,
      diff:     /Difficulty[：:]\s*(.+)/i,
      scenario: /Scenario[：:]\s*\n([\s\S]+?)(?=\nRequirements[：:]|\nHints[：:]|$)/i,
      reqs:     /Requirements[：:]\s*\n([\s\S]+?)(?=\nHints[：:]|$)/i,
      hints:    /Hints[：:]\s*\n([\s\S]+?)$/i,
      diffMap:  { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
    }
  },

  'ja': {
    app_title: 'システム設計練習ツール',
    tab_srs: 'SRS 仕様書',
    tab_ai_skill: 'AI Skill',
    tab_system_design: 'システム設計',
    btn_scenario: '📋 シナリオ',
    btn_settings: '⚙ 設定',

    scenario_badge_srs: 'SRS 仕様書',
    scenario_badge_ai_skill: 'AI Skill',
    scenario_badge_system_design: 'システム設計',
    scenario_req_title: '要件リスト',
    scenario_hints_title: '💡 記述のヒント',
    scenario_btn_hint: '💡 ヒント',
    scenario_btn_hint_close: '💡 ヒントを閉じる',
    scenario_btn_next: '↺ 次の問題',
    scenario_btn_ai: '✨ AI 出題',
    scenario_generating: 'AI が新しい問題を生成中...',
    scenario_ai_title: 'AI 生成問題',

    editor_upload: '📁 ファイルを開く',
    editor_clear: '🗑 クリア',
    editor_placeholder: 'ここにドキュメントを入力してください\n\n.txt / .md ファイルのドラッグ＆ドロップも可能...',
    editor_chars: '文字',
    editor_evaluate: '🔍 評価する',
    drop_overlay: 'ドロップしてアップロード',

    results_header: '評価結果',
    results_empty_text: 'ドキュメントを入力し「評価する」をクリック',
    results_empty_hint: 'SRS 仕様書・AI Skill・システム設計に対応',
    results_loading: '分析中...',

    score_label_good: '良好',
    score_label_fair: '要改善',
    score_label_poor: '要強化',
    tag_done: '✓ 完了',
    tag_missing: '✗ 不足',
    tag_warning: '⚠ 警告',
    unit_items: ' 項目',

    section_missing: '✗ 不足項目',
    section_warnings: '⚠ 警告',
    section_found: '✓ 完了項目',
    section_ai: '🤖 AI 詳細レビュー',
    badge_required: '必須',
    ai_loading_text: 'ローカルモデルの応答を待っています...',

    settings_title: '設定',
    settings_engine_title: '評価エンジン',
    settings_local_label: 'ローカルモデル（Ollama）を使用した AI レビューを有効化',
    settings_local_hint: 'オフの場合はルールベースの評価のみ。オンにするとローカル AI モデルが詳細な分析を行います。',
    settings_model_title: 'ローカルモデル設定',
    settings_api_label: 'API URL',
    settings_model_name_label: 'モデル名',
    settings_test_btn: '接続テスト',
    settings_save_btn: '設定を保存',
    settings_testing: 'テスト中...',
    settings_test_ok: '接続成功 ✓',
    settings_test_fail: '接続失敗',

    doc_type_label_srs: 'SRS 仕様書',
    doc_type_label_ai_skill: 'AI Skill',
    doc_type_label_system_design: 'システム設計ドキュメント',

    ai_no_response: '（モデルから応答がありません）',
    ai_no_connect: 'ローカルモデルに接続できません',
    ai_check_ollama: 'Ollama が起動しており、モデル名が正しいことを確認してください。',
    ai_prompt_default: '以下のドキュメントをレビューし、日本語で回答してください：\n',

    ai_gen_prompt: (typeName) =>
      `あなたはシニアソフトウェアエンジニア兼技術面接官です。「${typeName}」を作成する練習のための全く新しいシナリオ問題を生成してください。\n\n以下の形式に完全に従って回答してください（余分な内容は不要です）：\nタイトル：[システム名、2〜6文字]\n難易度：[初級/中級/上級]\nシナリオ：\n[業務背景・規模・技術的課題を含む 2〜3 段落]\n要件：\n- [具体的な要件 1]\n- [具体的な要件 2]\n- [具体的な要件 3]\n- [具体的な要件 4]\n- [具体的な要件 5]\nヒント：\n- [ドキュメント作成のヒント 1]\n- [ドキュメント作成のヒント 2]\n- [ドキュメント作成のヒント 3]`,

    ai_parse: {
      title:    /タイトル[：:]\s*(.+)/,
      diff:     /難易度[：:]\s*(.+)/,
      scenario: /シナリオ[：:]\s*\n([\s\S]+?)(?=\n要件[：:]|\nヒント[：:]|$)/,
      reqs:     /要件[：:]\s*\n([\s\S]+?)(?=\nヒント[：:]|$)/,
      hints:    /ヒント[：:]\s*\n([\s\S]+?)$/,
      diffMap:  { '初級': 1, '中級': 2, '上級': 3 }
    }
  }
}
