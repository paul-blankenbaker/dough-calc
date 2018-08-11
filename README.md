# Bread Dough Calculator

In the summer of 2018, my wife and I decided to take a small course in
bread making. We enjoyed the class and I found it interesting in the
way that bread makers describe their recipes as formulas to simplify
scaling.

While it is not difficult to create an Excel spread sheet to
manipulate these formulas, I decided to create a simplified web page
that anyone can use.

# On-line Tool

If you have access to the internet, you don't need to install anything
to use this simple calculator. An on-line version that will run in your
web browser can be found at:

[http://redali.com/dough-calc](http://redali.com/dough-calc)

## Getting Started

- Rename ingredients as necessary.

- Set the percentage to 0.0 to temporarily delete an item.

- Set the percentage values of your dough formula (recipe) in the
  right hand column. By convention, your flour weight will be 100.

- If you have multiple types of flours in your recipe, then the sum of
  those flour percentages should come out to 100. For example, if you
  want the flour mix to be 90% white and 10% rye, set the white flour
  value to 90 and the rye value to 10.

## Using The Tool

Once you have your initial ingredients and percentage values set, you
can start playing with the numbers to answer the following types of
questions:

- I want to adjust the salt level to 3% of the total flour
  content. Change the **Percent** value in the *Salt* row to 3.0 and
  the rest of the numbers will update.

- I want to make 24 ounces of bread dough. Change the **Total Mass**
  units to *oz* and then set the value to *24.0*.

- I want to make 500 grams of bread dough. Change the **Total Mass**
  units to *g* and then set the value to *500.0*.

- I want to use 16 ounces of flour. Change the value of **Wt (oz)**
  column to 16.00 for the *Flour* row and all of the other ingredients
  and total mass will update accordingly.

- I want to use a 7 g packet of instant yeast. Change the value of
  **Mass (g)** column to 7.0 for the *Yeast* row and all of the other
  ingredients and total mass will update accordingly.

- I want to combine multiple flours so that I have 85% white, 5% rye
  and 10% wheat. Make sure you have 3 rows for flour in your
  table. Set the percent value of the white flour row to 85, the rye
  flour row to 5 and the wheat row to 10.

## Total Mass

This field is used to set and view the total mass of the dough. This
is the final value you should measure after combining all of the
ingredients.

If you change this value, then the values in the **Mass (g)** and **Wt
(oz)** columns will be adjusted accordingly.

## The "Percentage" Column

This column is used to enter the formula (recipe) for your bread
dough. Bread dough formulas are defined in arbitrary units that can be
scaled to real world values.

By convention the total value for all of the flour should be 100. This
allows bakers to think of all other ingredients as a percentage of
flour weight. For example, if the flour value is set to 100 and the
salt value is set to 2, then the amount of salt in the recipe will be
2% of the mass of the flour in the recipe (for every 100 grams of
flour, there will be 2 grams or salt).

Here is an example formula:

| Ingredient | Mass (g) | Wt (oz) | Percent |
|------------|----------|---------|---------|
| White      |    888.3 |   31.33 |  100.00 |
| Yeast      |      5.8 |    0.20 |    0.65 |
| Salt       |     17.8 |    0.63 |    2.00 |
| Water      |    604.4 |   21.32 |   68.00 |

If your formula has multiple flour rows, then you will typically want
to set those rows so that the sum of the flour rows is 100. For
example if you want the flour to be composed of 90% white and 10% rye,
you would enter:

| Ingredient | Mass (g) | Wt (oz) | Percent |
|------------|----------|---------|---------|
| White      |    800.0 |   28.22 |   90.00 |
| Wheat      |     88.9 |    3.14 |   10.00 |
| Yeast      |      5.8 |    0.20 |    0.65 |
| Salt       |     17.8 |    0.63 |    2.00 |
| Water      |    604.4 |   21.32 |   68.00 |

## The Mass/Weight Columns

Bakers prefer using mass or weight instead of volumes when mixing
ingredients. This reduces issues related to density. The mass and
weight columns display how much of each ingredient will be required in
both grams and ounces.

If you change the mass or weight of an ingredient, the **Total Mass**
will be recalculated and the mass and weight of all ingredients will
be adjusted to maintain the same percentages.

This is not a common use case, but if you only had 500 g of flour left
to work with, it will figure out the values for the rest of your
ingredients for you.

# Modifying The Tool

This is a rather simple tool with the following design goals:

* It performs a single simple task.

* It should run in any modern HTML 5 browser.

* It requires no server side processing (you can copy the source files
  to your disk and use it off line if necessary).

Feel free to modify, extend or completely re-factor.
