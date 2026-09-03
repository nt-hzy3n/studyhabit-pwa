#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StudyHabit - Offline-First Student Learning Habits Survey PWA
Data Analysis Pipeline (Python, Pandas, Matplotlib)

This script performs post-survey social-science analysis on survey responses exported from Google Sheets:
1. Data ingestion & JSON answers parsing
2. Data cleaning & missing-value handling
3. Descriptive statistics & frequency distributions
4. Hypothesis & correlation analysis:
   - Study time vs. Perceived effectiveness
   - Sleep duration vs. Concentration rating
   - AI tools adoption frequency
5. High-resolution chart generation into output/
"""

import os
import sys
import json

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Setup clean visual style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Segoe UI', 'sans-serif']
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'sample_responses.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')

os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_and_clean_data(csv_path):
    print("=" * 60)
    print("STUDYHABIT - POST-COLLECTION DATA ANALYSIS")
    print("Khảo sát thói quen học tập của sinh viên")
    print("=" * 60)

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Cannot find CSV at: {csv_path}")

    print(f"[1] Loading raw exported CSV from: {csv_path}")
    raw_df = pd.read_csv(csv_path)
    print(f"    Raw records loaded: {len(raw_df)}")

    # Parse JSON answers column
    parsed_rows = []
    for idx, row in raw_df.iterrows():
        ans_raw = row.get('answers', '{}')
        try:
            ans = json.loads(ans_raw) if isinstance(ans_raw, str) else ans_raw
        except Exception:
            ans = {}
        
        parsed = {
            'id': row.get('id'),
            'surveyId': row.get('surveyId'),
            'submittedAt': row.get('submittedAt'),
            'deviceId': row.get('deviceId'),
            'academic_year': ans.get('sh-q1'),
            'major': ans.get('sh-q2'),
            'study_time_daily': ans.get('sh-q3'),
            'study_days_per_week': ans.get('sh-q4'),
            'study_time_of_day': ans.get('sh-q5'),
            'study_location': ans.get('sh-q6'),
            'study_format': ans.get('sh-q7'),
            'learning_methods': ans.get('sh-q8', []),
            'review_after_class': pd.to_numeric(ans.get('sh-q9'), errors='coerce'),
            'study_planning': pd.to_numeric(ans.get('sh-q10'), errors='coerce'),
            'concentration': pd.to_numeric(ans.get('sh-q11'), errors='coerce'),
            'social_media_distraction': pd.to_numeric(ans.get('sh-q12'), errors='coerce'),
            'primary_device': ans.get('sh-q13'),
            'ai_tools_usage': ans.get('sh-q14'),
            'sleep_duration': ans.get('sh-q15'),
            'sleep_lack_effect': pd.to_numeric(ans.get('sh-q16'), errors='coerce'),
            'perceived_effectiveness': pd.to_numeric(ans.get('sh-q17'), errors='coerce'),
            'biggest_difficulty': ans.get('sh-q18'),
            'improvement_wish': ans.get('sh-q19', ''),
            'additional_comments': ans.get('sh-q20', '')
        }
        parsed_rows.append(parsed)

    df = pd.DataFrame(parsed_rows)

    # Missing value handling
    print("[2] Data Cleaning & Missing-Value Imputation:")
    numeric_cols = ['review_after_class', 'study_planning', 'concentration',
                    'social_media_distraction', 'sleep_lack_effect', 'perceived_effectiveness']
    for col in numeric_cols:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"    - Imputed {missing_count} missing in '{col}' with median: {median_val}")
        else:
            print(f"    - Column '{col}': 0 missing values (100% complete)")

    return df

def generate_descriptive_stats(df):
    print("\n" + "=" * 60)
    print("[3] DESCRIPTIVE STATISTICS")
    print("=" * 60)

    total_responses = len(df)
    avg_concentration = df['concentration'].mean()
    avg_effectiveness = df['perceived_effectiveness'].mean()
    avg_planning = df['study_planning'].mean()
    avg_social_distraction = df['social_media_distraction'].mean()
    avg_sleep_effect = df['sleep_lack_effect'].mean()

    print(f"Total Valid Survey Responses : {total_responses}")
    print(f"Average Concentration Rating : {avg_concentration:.2f} / 5.0")
    print(f"Average Perceived Effectiveness : {avg_effectiveness:.2f} / 5.0")
    print(f"Average Study Planning Score : {avg_planning:.2f} / 5.0")
    print(f"Social Media Distraction Avg : {avg_social_distraction:.2f} / 5.0")
    print(f"Lack of Sleep Impact Rating  : {avg_sleep_effect:.2f} / 5.0")

    print("\n[Study Time Distribution]")
    print(df['study_time_daily'].value_counts())

    print("\n[Top Study Locations]")
    print(df['study_location'].value_counts())

    print("\n[Primary Devices]")
    print(df['primary_device'].value_counts())

    print("\n[AI Tool Adoption]")
    print(df['ai_tools_usage'].value_counts())

    return {
        'total': total_responses,
        'avg_concentration': avg_concentration,
        'avg_effectiveness': avg_effectiveness,
    }

def create_visualizations(df, output_dir):
    print("\n" + "=" * 60)
    print("[4] GENERATING RESEARCH CHARTS")
    print("=" * 60)

    primary_color = '#0284c7'
    accent_color = '#0ea5e9'
    secondary_color = '#f59e0b'
    green_color = '#10b981'

    # Chart 1: Study Time Distribution
    plt.figure(figsize=(8, 5))
    order = ['Dưới 1 giờ', '1–2 giờ', '2–4 giờ', '4–6 giờ', 'Trên 6 giờ']
    counts = df['study_time_daily'].value_counts().reindex(order).fillna(0)
    bars = plt.bar(order, counts, color=primary_color, edgecolor='#0369a1', width=0.55)
    plt.title('Distribution of Daily Independent Study Time (Hours/Day)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Study Hours Range', fontsize=10, fontweight='600')
    plt.ylabel('Number of Students', fontsize=10, fontweight='600')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            plt.text(bar.get_x() + bar.get_width()/2., h + 0.15, f'{int(h)}', ha='center', va='bottom', fontweight='bold', color='#0f172a')
    plt.tight_layout()
    chart1_path = os.path.join(output_dir, 'study_time_distribution.png')
    plt.savefig(chart1_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart1_path}")

    # Chart 2: Study Location Distribution
    plt.figure(figsize=(8, 5))
    loc_counts = df['study_location'].value_counts()
    bars = plt.barh(loc_counts.index, loc_counts.values, color=accent_color, edgecolor='#0284c7', height=0.55)
    plt.title('Preferred Study Locations Among Students', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Number of Students', fontsize=10, fontweight='600')
    plt.ylabel('Location', fontsize=10, fontweight='600')
    plt.grid(axis='x', linestyle='--', alpha=0.5)
    for bar in bars:
        w = bar.get_width()
        plt.text(w + 0.1, bar.get_y() + bar.get_height()/2., f'{int(w)}', ha='left', va='center', fontweight='bold')
    plt.tight_layout()
    chart2_path = os.path.join(output_dir, 'study_location_distribution.png')
    plt.savefig(chart2_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart2_path}")

    # Chart 3: Learning Methods Adoption (Exploding list of multiple-choice answers)
    all_methods = []
    for item in df['learning_methods']:
        if isinstance(item, list):
            all_methods.extend(item)
    method_counts = pd.Series(all_methods).value_counts().head(8)

    plt.figure(figsize=(9, 5.5))
    bars = plt.barh(method_counts.index, method_counts.values, color=green_color, edgecolor='#059669', height=0.55)
    plt.title('Common Learning Methods Adopted by Students', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Count of Mentions', fontsize=10, fontweight='600')
    plt.grid(axis='x', linestyle='--', alpha=0.5)
    for bar in bars:
        w = bar.get_width()
        plt.text(w + 0.1, bar.get_y() + bar.get_height()/2., f'{int(w)}', ha='left', va='center', fontweight='bold')
    plt.tight_layout()
    chart3_path = os.path.join(output_dir, 'learning_methods.png')
    plt.savefig(chart3_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart3_path}")

    # Chart 4: Concentration Rating Distribution
    plt.figure(figsize=(7, 4.8))
    conc_counts = df['concentration'].value_counts().sort_index()
    x_stars = [1, 2, 3, 4, 5]
    y_vals = [conc_counts.get(i, 0) for i in x_stars]
    bars = plt.bar([f'{i} Stars' for i in x_stars], y_vals, color=secondary_color, edgecolor='#d97706', width=0.5)
    plt.title('Self-Reported Concentration Level (Rating 1–5)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Rating Scale', fontsize=10, fontweight='600')
    plt.ylabel('Number of Students', fontsize=10, fontweight='600')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            plt.text(bar.get_x() + bar.get_width()/2., h + 0.1, f'{int(h)}', ha='center', va='bottom', fontweight='bold')
    plt.tight_layout()
    chart4_path = os.path.join(output_dir, 'concentration_distribution.png')
    plt.savefig(chart4_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart4_path}")

    # Chart 5: Perceived Effectiveness Rating
    plt.figure(figsize=(7, 4.8))
    eff_counts = df['perceived_effectiveness'].value_counts().sort_index()
    y_eff = [eff_counts.get(i, 0) for i in x_stars]
    bars = plt.bar([f'{i} Stars' for i in x_stars], y_eff, color='#6366f1', edgecolor='#4338ca', width=0.5)
    plt.title('Perceived Effectiveness of Current Study Habits', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Rating Scale', fontsize=10, fontweight='600')
    plt.ylabel('Number of Students', fontsize=10, fontweight='600')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            plt.text(bar.get_x() + bar.get_width()/2., h + 0.1, f'{int(h)}', ha='center', va='bottom', fontweight='bold')
    plt.tight_layout()
    chart5_path = os.path.join(output_dir, 'effectiveness_distribution.png')
    plt.savefig(chart5_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart5_path}")

    # Chart 6: Relationship Analysis: Study Time vs. Perceived Effectiveness
    time_order = ['Dưới 1 giờ', '1–2 giờ', '2–4 giờ', '4–6 giờ', 'Trên 6 giờ']
    eff_by_time = df.groupby('study_time_daily', observed=False)['perceived_effectiveness'].mean().reindex(time_order)

    plt.figure(figsize=(8, 5))
    plt.plot(eff_by_time.index, eff_by_time.values, marker='o', color='#0284c7', linewidth=2.5, markersize=8)
    plt.title('Relationship: Study Duration vs. Average Perceived Effectiveness', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Daily Study Duration', fontsize=10, fontweight='600')
    plt.ylabel('Average Effectiveness (1–5)', fontsize=10, fontweight='600')
    plt.ylim(1.0, 5.2)
    plt.grid(True, linestyle='--', alpha=0.6)
    for i, txt in enumerate(eff_by_time.values):
        if not np.isnan(txt):
            plt.annotate(f'{txt:.2f}', (eff_by_time.index[i], txt + 0.15), ha='center', fontweight='bold', color='#0369a1')
    plt.tight_layout()
    chart6_path = os.path.join(output_dir, 'study_time_vs_effectiveness.png')
    plt.savefig(chart6_path, dpi=200)
    plt.close()
    print(f"    Saved: {chart6_path}")

    print("\nAll 6 research charts generated successfully in /analysis/output/")

def main():
    df = load_and_clean_data(CSV_PATH)
    generate_descriptive_stats(df)
    create_visualizations(df, OUTPUT_DIR)
    print("\nAnalysis pipeline executed successfully!")

if __name__ == '__main__':
    main()
