
document.getElementById('nameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const surname = document.getElementById('surname').value;
    const gender = document.getElementById('gender').value;
    const name = generateName(surname, gender);
    document.getElementById('result').innerText = '建议的名字：' + name;
});
function generateName(surname, gender) {
    const maleNames = ['浩宇', '子轩', '天翊', '思远'];
    const femaleNames = ['梓涵', '欣怡', '婧琪', '雨婷'];
    const chosenName = gender === 'male' ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    return surname + chosenName;
}
