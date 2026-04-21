export const cvData = {
  name: "Zhiyuan Zeng",
  nameZh: "曾致远",
  title: "Joint PhD Student",
  affiliations: [
    { name: "Fudan University", url: "https://www.fudan.edu.cn/en/" },
    { name: "ByteDance Seed", url: "https://seed.bytedance.com/" }
  ],
  contact: {
    email: "zhiyuan.zeng.nlper@gmail.com",
    location: "Beijing, China",
    scholar: "https://scholar.google.com/citations?user=TFo8wCEAAAAJ&hl=zh-CN",
    github: "https://github.com/",
    cv: "/CV.pdf",
    photo: "/me.jpg"
  },

  bio: [
    "I am a joint PhD student in Computer Science at Fudan University and ByteDance Seed, advised by Professor Xipeng Qiu and Wenhao Huang.",
    "Previously, I obtained my MA in Computer Science at Tianjin University, where I was advised by Professor Deyi Xiong. From 2023 to 2024, I interned at Shanghai AI Lab (OpenLMLab / InternLM)."
  ],

  researchInterests: [
    "Synthetic Data",
    "Reinforcement Learning",
    "Evaluation"
  ],

  education: [
    {
      school: "Fudan University & ByteDance Seed",
      degree: "Joint PhD in Computer Science",
      location: "Beijing, China",
      period: "2023 – Present",
      mentors: "Prof. Xipeng Qiu & Wenhao Huang"
    },
    {
      school: "Tianjin University",
      degree: "MA in Computer Science",
      location: "Tianjin, China",
      period: "2020 – 2023",
      mentors: "Prof. Deyi Xiong"
    }
  ],

  experience: [
    {
      company: "ByteDance Seed",
      role: "Research Intern, Seed Edge",
      location: "Beijing, China",
      period: "April 2025 – Present",
      bullets: [
        "Synthetic Data: Long-Context and Scalable Synthetic Data.",
        "Evaluation: A dynamic, live benchmark for Future Prediction (FutureX and FutureX-Pro).",
        "RL: Improving Stability and Robustness of RL."
      ]
    },
    {
      company: "Shanghai AI Lab (OpenLMLab / InternLM)",
      role: "Research Intern",
      location: "Shanghai, China",
      period: "April 2023 – January 2024",
      bullets: [
        "MoE routing without token dropout and padding.",
        "Efficient MoE with topology-aware communication."
      ]
    }
  ],

  publicationGroups: [
    {
      topic: "Data and Evaluation",
      items: [
        {
          title: "Understanding via Reconstruction: Reversing the Software Development Process for LLM Pretraining",
          authors: "Zhiyuan Zeng*, Jiashuo Liu*, Xipeng Qiu, Wenhao Huang, et al.",
          venue: "Under Review",
          year: "2026",
          tag: "Seed",
          links: { pdf: "https://arxiv.org/abs/2603.11103" }
        },
        {
          title: "FutureX: An Advanced Live Benchmark for LLM Agents in Future Prediction",
          authors: "Zhiyuan Zeng*, Jiashuo Liu*, Xipeng Qiu, Wenhao Huang, et al.",
          venue: "ICLR",
          year: "2026",
          tag: "Seed",
          links: { pdf: "https://arxiv.org/abs/2508.11987" }
        },
        {
          title: "FutureX-Pro: Extending Future Prediction to High-Value Vertical Domains",
          authors: "Jiashuo Liu, Siyuan Chen, Zaiyuan Wang, Zhiyuan Zeng, et al.",
          venue: "Under Review",
          year: "2026",
          tag: "Seed",
          links: { pdf: "https://arxiv.org/abs/2601.12259" }
        },
        {
          title: "Revisiting the Test-Time Scaling of o1-like Models: Do they Truly Possess Test-Time Scaling Capabilities?",
          authors: "Zhiyuan Zeng, Qinyuan Cheng, Zhangyue Yin, Yunhua Zhou, Xipeng Qiu, et al.",
          venue: "ACL",
          year: "2025",
          links: { pdf: "https://arxiv.org/abs/2502.12215" }
        }
      ]
    },
    {
      topic: "Reinforcement Learning",
      items: [
        {
          title: "RLoop: A Self-Improving Framework for Reinforcement Learning with Iterative Policy Initialization",
          authors: "Zhiyuan Zeng, Jiashuo Liu, Zhangyue Yin, Ge Zhang, Wenhao Huang, Xipeng Qiu",
          venue: "Under Review",
          year: "2026",
          tag: "Seed",
          links: { pdf: "https://arxiv.org/abs/2511.04285" }
        },
        {
          title: "Balanced Aggregation: Understanding and Fixing Aggregation Bias in GRPO",
          authors: "Zhiyuan Zeng, Jiameng Huang, Ge Zhang, Wenhao Huang, Xipeng Qiu, et al.",
          venue: "Under Review",
          year: "2026",
          tag: "Seed",
          links: {}
        }
      ]
    },
    {
      topic: "Model Architecture",
      items: [
        {
          title: "Memorize Step by Step: Efficient Long-Context Prefilling with Incremental Memory and Decremental Chunk",
          authors: "Zhiyuan Zeng, Qipeng Guo, Xiaoran Liu, Xipeng Qiu, et al.",
          venue: "EMNLP",
          year: "2024",
          links: { pdf: "https://aclanthology.org/2024.emnlp-main.1169/" }
        },
        {
          title: "Turn Waste into Worth: Rectifying Top-k Router of MoE",
          authors: "Zhiyuan Zeng, Qipeng Guo, Zhaoye Fei, Xipeng Qiu, et al.",
          venue: "EMNLP",
          year: "2024",
          tag: "InternLM",
          links: { pdf: "https://arxiv.org/abs/2402.12399" }
        },
        {
          title: "SCoMoE: Efficient Mixture of Experts with Structured Communication",
          authors: "Zhiyuan Zeng, Deyi Xiong",
          venue: "ICLR",
          year: "2023",
          links: { pdf: "https://openreview.net/pdf?id=s-c96mSU0u5" }
        }
      ]
    },
    {
      topic: "Others",
      items: [
        {
          title: "Scaling of Search and Learning: A Roadmap to Reproduce o1 from Reinforcement Learning Perspective",
          authors: "Zhiyuan Zeng*, Qinyuan Cheng*, Zhangyue Yin*, Bo Wang*, Xipeng Qiu, et al.",
          venue: "arXiv",
          year: "2024",
          links: { pdf: "https://arxiv.org/abs/2412.14135" }
        },
        {
          title: "Unsupervised and Few-Shot Parsing from Pretrained Language Models",
          authors: "Zhiyuan Zeng, Deyi Xiong",
          venue: "Artificial Intelligence (AIJ), Volume 305",
          year: "2022",
          links: { pdf: "https://doi.org/10.1016/j.artint.2022.103665" }
        },
        {
          title: "An Empirical Study on Adversarial Attack on NMT: Languages and Positions Matter",
          authors: "Zhiyuan Zeng, Deyi Xiong",
          venue: "ACL",
          year: "2021",
          links: { pdf: "https://aclanthology.org/2021.acl-short.58.pdf" }
        }
      ]
    }
  ]
};
