-- Change category from single text to text array, add 'snack'
alter table food_items drop constraint food_items_category_check;
alter table food_items alter column category drop default;
alter table food_items alter column category type text[] using array[category];
alter table food_items alter column category set default '{other}';
alter table food_items add constraint food_items_categories_check
  check (category <@ array['fruit','veggie','grain','protein','dairy','snack','other']::text[]);
