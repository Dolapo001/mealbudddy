import pytest

from services.metrics_service import MetricsService


def test_bmi_matches_frontend_formula():
    # 72kg, 178cm -> 22.7
    assert MetricsService.bmi(72, 178) == 22.7


@pytest.mark.parametrize(
    "value,expected",
    [(17, "Underweight"), (22, "Normal weight"), (27, "Overweight"), (32, "Obese")],
)
def test_bmi_categories(value, expected):
    assert MetricsService.bmi_category(value) == expected


def test_bmr_mifflin_st_jeor_male():
    # 10*72 + 6.25*178 - 5*22 + 5 = 720 + 1112.5 - 110 + 5 = 1727.5 -> 1728
    assert MetricsService.bmr(72, 178, 22, "male") == 1728


def test_derive_applies_goal_offset_and_floor():
    d = MetricsService.derive(
        weight_kg=72, height_cm=178, age=22, sex="male", activity="moderate", goal="gain_muscle"
    )
    assert d.goal_offset_kcal == 300
    assert d.target_kcal == d.tdee + 300
    assert d.protein_target_g == round(72 * 2.0)


def test_target_never_below_floor():
    d = MetricsService.derive(
        weight_kg=45, height_cm=150, age=80, sex="female", activity="sedentary", goal="lose"
    )
    assert d.target_kcal >= 1200
