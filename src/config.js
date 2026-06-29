const PC2_DEFAULT_CONFIG = {
    pc2_enabled: true,
    pc2_fancy_bg: true,
    pc2_sounds_enabled: false,
    pc2_sound_library: [
        {
            title: "ACPC Song",
            url: "sounds/ACPC_Song.mp3",
            verdicts: ["action_finish"],
            id: "1782686883145-pev5d",
            enabled: true
        },
        {
            title: "Accepted",
            url: "sounds/Accepted.mp3",
            verdicts: ["correct"],
            id: "1782687463774-kiywk",
            enabled: true
        },
        {
            title: "Wrong Answer",
            url: "sounds/WrongAnswer.mp3",
            verdicts: ["wrong_answer"],
            id: "1782691140351-xiwnk",
            enabled: true
        },
        {
            title: "Time Limit Exceeded",
            url: "sounds/TimeLimitExceeded.mp3",
            verdicts: ["time_limit"],
            id: "1782691259051-dmy5t",
            enabled: true
        },
        {
            title: "Memory Limit Exceeded",
            url: "sounds/MemoryLimitExceeded.mp3",
            verdicts: ["memory_limit"],
            id: "1782691371353-wlntt",
            enabled: true
        },
        {
            title: "Runtime Error",
            url: "sounds/RuntimeError.mp3",
            verdicts: ["runtime_error"],
            id: "1782691489787-hgvst",
            enabled: true
        },
        {
            title: "Compilation Failed",
            url: "sounds/CompilationFailed.mp3",
            verdicts: ["compilation_error"],
            id: "1782691597083-4jold",
            enabled: true
        },
        {
            title: "Idleness Limit Exceeded",
            url: "sounds/IdlenessLimitExceeded.mp3",
            verdicts: ["idleness_limit"],
            id: "1782691864442-9a54p",
            enabled: true
        }
    ],
    pc2_theme: "classic",
    pc2_scale: 1,
    pc2_start_maximized: false,
    pc2_auto_refresh_runs: false,
    pc2_default_tab: "tab-submit",
    pc2_show_submit_confirm: true,
    pc2_pdf_theme: "clean",
    pc2_custom_print_css: "",
    pc2_print_page_size: "A4",
    pc2_print_show_header: false
};
